import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeilisearchService } from '../meilisearch/meilisearch.service';
import { BadgeService } from '../badge/badge.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { VisitStatus } from '@prisma/client';

@Injectable()
export class VisitsService {
  constructor(
    private prisma: PrismaService,
    private meilisearch: MeilisearchService,
    private badge: BadgeService,
  ) {}


  /**
   * Generate a unique 4-digit PIN for self check-in
   */
  private async generateUniquePin(): Promise<string> {
    let pin: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!isUnique && attempts < maxAttempts) {
      // Generate random 4-digit PIN (1000-9999)
      pin = Math.floor(1000 + Math.random() * 9000).toString();

      // Check if PIN is already in use for active visits (not checked_out or cancelled)
      const existingVisit = await this.prisma.visit.findFirst({
        where: {
          checkInPin: pin,
          status: {
            in: [VisitStatus.pending, VisitStatus.approved, VisitStatus.checked_in],
          },
        },
      });

      isUnique = !existingVisit;
      attempts++;
    }

    if (!isUnique) {
      throw new BadRequestException('Unable to generate unique PIN. Please try again.');
    }

    return pin;
  }

  async create(createVisitDto: CreateVisitDto, createdById: string) {
    // Generate unique 4-digit PIN for self check-in
    const checkInPin = await this.generateUniquePin();

    const visit = await this.prisma.visit.create({
      data: {
        ...createVisitDto,
        scheduledDate: new Date(createVisitDto.scheduledDate),
        scheduledTimeStart: new Date(createVisitDto.scheduledTimeStart),
        scheduledTimeEnd: createVisitDto.scheduledTimeEnd
          ? new Date(createVisitDto.scheduledTimeEnd)
          : undefined,
        status: VisitStatus.pending,
        checkInPin,
        createdById,
      },
      include: {
        visitor: true,
        department: true,
      },
    });

    await this.meilisearch.indexVisit(visit);

    return visit;
  }

  async findAll(
    status?: VisitStatus,
    hostId?: string,
    date?: string,
    search?: string,
  ) {
    if (search) {
      const filters: string[] = [];
      if (status) filters.push(`status = "${status}"`);
      if (date) filters.push(`scheduledDate = "${date}"`);

      const results = await this.meilisearch.searchVisits(
        search,
        filters.length > 0 ? filters.join(' AND ') : undefined,
      );
      return results.hits;
    }

    const where: any = {};
    if (status) where.status = status;
    if (hostId) where.hostUserId = hostId;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.scheduledDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.visit.findMany({
      where,
      include: {
        visitor: true,
        department: true,
        hostUser: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { scheduledDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: {
        visitor: true,
        department: true,
        hostUser: {
          select: { id: true, firstName: true, lastName: true },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!visit) {
      throw new NotFoundException(`Visit ${id} not found`);
    }

    return visit;
  }

  async update(id: string, updateVisitDto: UpdateVisitDto) {
    const visit = await this.prisma.visit.update({
      where: { id },
      data: {
        ...updateVisitDto,
        scheduledDate: updateVisitDto.scheduledDate
          ? new Date(updateVisitDto.scheduledDate)
          : undefined,
        scheduledTimeStart: updateVisitDto.scheduledTimeStart
          ? new Date(updateVisitDto.scheduledTimeStart)
          : undefined,
        scheduledTimeEnd: updateVisitDto.scheduledTimeEnd
          ? new Date(updateVisitDto.scheduledTimeEnd)
          : undefined,
      },
      include: {
        visitor: true,
        department: true,
      },
    });

    await this.meilisearch.indexVisit(visit);

    return visit;
  }

  async remove(id: string) {
    await this.prisma.visit.delete({ where: { id } });
    await this.meilisearch.deleteVisit(id);
    return { message: 'Visit deleted successfully' };
  }

  /**
   * Check-in: visitatore arriva e ottiene badge
   */
  async checkIn(id: string) {
    const visit = await this.findOne(id);

    if (visit.status === VisitStatus.checked_in) {
      throw new BadRequestException('Visit already checked in');
    }

    if (visit.status === VisitStatus.checked_out) {
      throw new BadRequestException('Visit already completed');
    }

    if (visit.status === VisitStatus.cancelled) {
      throw new BadRequestException('Cannot check-in a cancelled visit');
    }

    // Genera badge
    const badgeNumber = this.badge.generateBadgeNumber();
    const barcode = await this.badge.generateBadgeBarcode(badgeNumber);

    // Aggiorna visita
    const updatedVisit = await this.prisma.visit.update({
      where: { id },
      data: {
        status: VisitStatus.checked_in,
        actualCheckIn: new Date(),
        badgeNumber,
        badgeQRCode: barcode, // Manteniamo il campo badgeQRCode per compatibilità, ma ora contiene un barcode
        badgeIssued: true,
        badgeIssuedAt: new Date(),
      },
      include: {
        visitor: true,
        department: true,
        hostUser: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    await this.meilisearch.indexVisit(updatedVisit);

    // Audit log
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'check_in',
          entityType: 'visit',
          entityId: id,
          details: `Check-in from dashboard for ${updatedVisit.visitor.firstName} ${updatedVisit.visitor.lastName}`,
          userId: null,
          ipAddress: null,
        },
      });
    } catch (error) {
      console.error('Audit log error:', error.message);
    }

    return updatedVisit;
  }

  /**
   * Check-out: visitatore esce
   */
  async checkOut(id: string) {
    const visit = await this.findOne(id);

    if (visit.status !== VisitStatus.checked_in) {
      throw new BadRequestException('Visit not checked in');
    }

    const updatedVisit = await this.prisma.visit.update({
      where: { id },
      data: {
        status: VisitStatus.checked_out,
        actualCheckOut: new Date(),
      },
      include: {
        visitor: true,
        department: true,
        hostUser: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    await this.meilisearch.indexVisit(updatedVisit);

    // Audit log
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'check_out',
          entityType: 'visit',
          entityId: id,
          details: `Check-out from dashboard for ${updatedVisit.visitor.firstName} ${updatedVisit.visitor.lastName}`,
          userId: null,
          ipAddress: null,
        },
      });
    } catch (error) {
      console.error('Audit log error:', error.message);
    }

    return updatedVisit;
  }

  /**
   * Ottieni visite attualmente presenti (checked-in)
   */
  async getCurrentVisits() {
    return this.prisma.visit.findMany({
      where: { status: VisitStatus.checked_in },
      include: {
        visitor: true,
        department: true,
        hostUser: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { actualCheckIn: 'desc' },
    });
  }

  /**
   * Ottieni badge QR code per stampa
   */
  async getBadge(id: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: {
        visitor: true,
        department: true,
        hostUser: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!visit) {
      throw new NotFoundException(`Visit ${id} not found`);
    }

    if (!visit.badgeIssued) {
      throw new NotFoundException('Badge not issued for this visit');
    }

    return {
      visitId: visit.id,
      badgeNumber: visit.badgeNumber,
      qrCode: visit.badgeQRCode,
      visitor: {
        name: `${visit.visitor.firstName} ${visit.visitor.lastName}`,
        company: visit.visitor.company,
      },
      host: visit.hostUser ? `${visit.hostUser.firstName} ${visit.hostUser.lastName}` : visit.hostName || 'N/A',
      validUntil: this.badge.calculateBadgeExpiry(visit.scheduledTimeEnd),
    };
  }

  /**
   * Cancella visita
   */
  async cancel(id: string) {
    const existing = await this.findOne(id);

    if (existing.status === VisitStatus.cancelled) {
      throw new BadRequestException('La visita è già cancellata');
    }

    if (existing.status === VisitStatus.checked_out) {
      throw new BadRequestException('Impossibile cancellare una visita già completata');
    }

    const visit = await this.prisma.visit.update({
      where: { id },
      data: { status: VisitStatus.cancelled },
      include: {
        visitor: true,
        department: true,
      },
    });

    await this.meilisearch.indexVisit(visit);

    // Audit log
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'update',
          entityType: 'visit',
          entityId: id,
          details: `Visit cancelled for ${visit.visitor.firstName} ${visit.visitor.lastName}`,
          userId: null,
          ipAddress: null,
        },
      });
    } catch (error) {
      console.error('Audit log error:', error.message);
    }

    return visit;
  }

  /**
   * Riattiva visita cancellata o scaduta
   */
  async reactivate(id: string) {
    const visit = await this.findOne(id);

    // Verifica che la visita sia in uno stato riattivabile
    if (visit.status !== VisitStatus.cancelled && visit.status !== VisitStatus.checked_out) {
      throw new BadRequestException('Only cancelled or completed visits can be reactivated');
    }

    // Se la visita aveva un badge, lo resettiamo
    const shouldResetBadge = visit.badgeIssued;

    const updatedVisit = await this.prisma.visit.update({
      where: { id },
      data: {
        status: VisitStatus.pending,
        ...(shouldResetBadge && {
          badgeNumber: null,
          badgeQRCode: null,
          badgeIssued: false,
          badgeIssuedAt: null,
          actualCheckIn: null,
          actualCheckOut: null,
        }),
      },
      include: {
        visitor: true,
        department: true,
        hostUser: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    await this.meilisearch.indexVisit(updatedVisit);

    return updatedVisit;
  }

  /**
   * Duplica visita per creare una nuova visita con gli stessi dati
   */
  async duplicate(id: string, createdById: string) {
    const originalVisit = await this.findOne(id);

    // Genera nuovo PIN unico
    const checkInPin = await this.generateUniquePin();

    const duplicatedVisit = await this.prisma.visit.create({
      data: {
        visitorId: originalVisit.visitorId,
        departmentId: originalVisit.departmentId,
        visitType: originalVisit.visitType,
        purpose: originalVisit.purpose,
        scheduledDate: originalVisit.scheduledDate,
        scheduledTimeStart: originalVisit.scheduledTimeStart,
        scheduledTimeEnd: originalVisit.scheduledTimeEnd,
        hostUserId: originalVisit.hostUserId,
        hostName: originalVisit.hostName,
        notes: originalVisit.notes ? `[DUPLICATED] ${originalVisit.notes}` : '[DUPLICATED]',
        status: VisitStatus.pending,
        checkInPin,
        createdById,
      },
      include: {
        visitor: true,
        department: true,
        hostUser: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    await this.meilisearch.indexVisit(duplicatedVisit);

    return duplicatedVisit;
  }

  /**
   * Invia notifica email al visitatore
   * TODO: Implementare servizio email
   */
  async sendNotification(id: string) {
    const visit = await this.findOne(id);

    // TODO: Implementare invio email con:
    // - PIN per check-in
    // - Dettagli visita
    // - Badge barcode (se già emesso)
    // - Informazioni host

    // Per ora ritorniamo un messaggio di conferma
    return {
      message: 'Notification sent successfully',
      visitId: visit.id,
      email: visit.visitor.email,
      // TODO: Aggiungere dettagli invio email reale
    };
  }

  /**
   * Eliminazione definitiva della visita (hard delete)
   * Solo per admin
   */
  async hardDelete(id: string) {
    const visit = await this.findOne(id);

    await this.prisma.visit.delete({ where: { id } });
    await this.meilisearch.deleteVisit(id);

    return {
      message: 'Visit permanently deleted',
      deletedVisitId: id
    };
  }

  /**
   * Statistiche dashboard
   */
  async getStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      currentVisitors,
      todayVisits,
      scheduledToday,
      totalThisMonth,
    ] = await Promise.all([
      this.prisma.visit.count({
        where: { status: VisitStatus.checked_in },
      }),
      this.prisma.visit.count({
        where: {
          actualCheckIn: { gte: today },
        },
      }),
      this.prisma.visit.count({
        where: {
          scheduledDate: { gte: today },
          status: { in: [VisitStatus.pending, VisitStatus.approved] },
        },
      }),
      this.prisma.visit.count({
        where: {
          scheduledDate: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
          },
        },
      }),
    ]);

    return {
      currentVisitors,
      todayVisits,
      scheduledToday,
      totalThisMonth,
    };
  }
}
