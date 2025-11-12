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


  async create(createVisitDto: CreateVisitDto, createdById: string) {
    const visit = await this.prisma.visit.create({
      data: {
        ...createVisitDto,
        scheduledDate: new Date(createVisitDto.scheduledDate),
        scheduledTimeStart: new Date(createVisitDto.scheduledTimeStart),
        scheduledTimeEnd: createVisitDto.scheduledTimeEnd
          ? new Date(createVisitDto.scheduledTimeEnd)
          : undefined,
        status: VisitStatus.pending,
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

    // Genera badge
    const badgeNumber = this.badge.generateBadgeNumber();
    const qrCode = await this.badge.generateBadgeQRCode(badgeNumber);

    // Aggiorna visita
    const updatedVisit = await this.prisma.visit.update({
      where: { id },
      data: {
        status: VisitStatus.checked_in,
        actualCheckIn: new Date(),
        badgeNumber,
        badgeQRCode: qrCode,
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
        photo: visit.visitor.photoPath,
      },
      host: visit.hostUser ? `${visit.hostUser.firstName} ${visit.hostUser.lastName}` : visit.hostName || 'N/A',
      validUntil: this.badge.calculateBadgeExpiry(visit.scheduledTimeEnd),
    };
  }

  /**
   * Cancella visita
   */
  async cancel(id: string) {
    const visit = await this.prisma.visit.update({
      where: { id },
      data: { status: VisitStatus.cancelled },
      include: {
        visitor: true,
        department: true,
      },
    });

    await this.meilisearch.indexVisit(visit);

    return visit;
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
          status: VisitStatus.approved,
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
