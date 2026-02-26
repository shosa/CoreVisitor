import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeService } from '../badge/badge.service';
import { PrintQueueService } from '../printer/print-queue.service';
import { MeilisearchService } from '../meilisearch/meilisearch.service';
import { VisitStatus } from '@prisma/client';
import { SelfRegisterDto } from './dto/self-register.dto';
import * as crypto from 'crypto';

@Injectable()
export class KioskService {
  constructor(
    private prisma: PrismaService,
    private badge: BadgeService,
    private printQueue: PrintQueueService,
    private meilisearch: MeilisearchService,
  ) {}

  /**
   * Verifica PIN e ottieni informazioni visita
   */
  async verifyPin(pin: string) {
    const visit = await this.prisma.visit.findFirst({
      where: {
        checkInPin: pin,
        status: {
          in: [VisitStatus.pending, VisitStatus.approved],
        },
        scheduledDate: {
          // Solo visite programmate per oggi
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      include: {
        visitor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            company: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!visit) {
      return null;
    }

    // Aggiungi full_name al visitor
    const visitorWithFullName = {
      ...visit.visitor,
      full_name: `${visit.visitor.firstName} ${visit.visitor.lastName}`,
    };

    return {
      ...visit,
      visitor: visitorWithFullName,
    };
  }

  /**
   * Effettua check-in con PIN e stampa badge
   */
  async checkInWithPin(pin: string) {
    // Trova la visita con il PIN
    const visit = await this.verifyPin(pin);

    if (!visit) {
      throw new HttpException(
        'PIN non valido o visita non trovata per oggi',
        HttpStatus.NOT_FOUND,
      );
    }

    // Verifica che la visita non sia già checked-in o completata
    if (visit.status === VisitStatus.checked_in) {
      throw new HttpException(
        'Visita già in stato checked-in',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (visit.status === VisitStatus.checked_out) {
      throw new HttpException(
        'Visita già completata (checked-out)',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Genera badge number univoco (usa BadgeService condiviso)
    const badgeNumber = this.badge.generateBadgeNumber();

    // Genera codice a barre del badge (base64 PNG)
    const badgeBarcode = await this.badge.generateBadgeBarcode(badgeNumber);

    // Effettua check-in
    const updatedVisit = await this.prisma.visit.update({
      where: { id: visit.id },
      data: {
        status: VisitStatus.checked_in,
        actualCheckIn: new Date(),
        badgeNumber,
        badgeQRCode: badgeBarcode,
        badgeIssued: true,
        badgeIssuedAt: new Date(),
      },
      include: {
        visitor: true,
        department: true,
        host: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Aggiorna privacy consent se non già impostato (il visitatore ha letto la disclaimer al check-in)
    if (!updatedVisit.visitor.privacyConsent) {
      await this.prisma.visitor.update({
        where: { id: updatedVisit.visitorId },
        data: { privacyConsent: true },
      });
      updatedVisit.visitor.privacyConsent = true;
    }

    // Aggiorna indice Meilisearch
    await this.meilisearch.indexVisit(updatedVisit);

    // Invia lavoro di stampa badge
    try {
      const badgeData = {
        visitorName: `${updatedVisit.visitor.firstName} ${updatedVisit.visitor.lastName}`,
        company: updatedVisit.visitor.company,
        badgeNumber: updatedVisit.badgeNumber,
        visitDate: new Date(updatedVisit.scheduledDate).toLocaleDateString('it-IT'),
        department: updatedVisit.department.name,
        host: updatedVisit.host
          ? `${updatedVisit.host.firstName} ${updatedVisit.host.lastName}`
          : updatedVisit.hostName,
        qrCode: updatedVisit.badgeQRCode,
      };
      await this.printQueue.addBadgePrintJob({
        visitId: visit.id,
        badgeData,
        copies: 1,
        priority: 1, // Alta priorità per self check-in
      });
    } catch (error) {
      console.error('Badge print error:', error.message);
      // Non blocchiamo il check-in se la stampa fallisce
    }

    // Log audit
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'check_in',
          entityType: 'visit',
          entityId: visit.id,
          details: `Self check-in from kiosk with PIN for ${visit.visitor.firstName} ${visit.visitor.lastName}`,
          userId: null, // Kiosk mode senza user
          ipAddress: null,
        },
      });
    } catch (error) {
      console.log('Audit log error:', error.message);
    }

    return {
      ...updatedVisit,
      visitor: {
        ...updatedVisit.visitor,
        full_name: `${updatedVisit.visitor.firstName} ${updatedVisit.visitor.lastName}`,
      },
    };
  }

  /**
   * Verifica validità badge e ottieni informazioni visita
   */
  async verifyBadge(badgeCode: string) {
    // Il badge code dovrebbe essere nel formato del badgeNumber o badgeQRCode
    // Cerchiamo la visita con questo badge

    const visit = await this.prisma.visit.findFirst({
      where: {
        OR: [
          { badgeNumber: badgeCode },
          { badgeQRCode: badgeCode },
          { id: badgeCode },
        ],
        status: VisitStatus.checked_in,
      },
      include: {
        visitor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            company: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!visit) {
      return null;
    }

    // Aggiungi full_name al visitor per compatibilità con app mobile
    const visitorWithFullName = {
      ...visit.visitor,
      full_name: `${visit.visitor.firstName} ${visit.visitor.lastName}`,
    };

    return {
      ...visit,
      visitor: visitorWithFullName,
    };
  }

  /**
   * Effettua check-out visitatore
   */
  async checkOut(visitId: string, badgeCode: string) {
    // Verifica che la visita esista e corrisponda al badge
    const visit = await this.prisma.visit.findFirst({
      where: {
        id: visitId,
        OR: [
          { badgeNumber: badgeCode },
          { badgeQRCode: badgeCode },
        ],
      },
    });

    if (!visit) {
      throw new HttpException(
        'Visita non trovata o badge non valido',
        HttpStatus.NOT_FOUND,
      );
    }

    if (visit.status !== VisitStatus.checked_in) {
      throw new HttpException(
        `Impossibile effettuare check-out. Stato attuale: ${visit.status}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Effettua check-out
    const updatedVisit = await this.prisma.visit.update({
      where: { id: visitId },
      data: {
        status: VisitStatus.checked_out,
        actualCheckOut: new Date(),
      },
      include: {
        visitor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
          },
        },
        department: true,
      },
    });

    // Aggiorna indice Meilisearch
    await this.meilisearch.indexVisit(updatedVisit);

    // Log audit
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'check_out',
          entityType: 'visit',
          entityId: visitId,
          details: `Check-out from kiosk for ${updatedVisit.visitor.firstName} ${updatedVisit.visitor.lastName}`,
          userId: null, // Kiosk mode senza user
          ipAddress: null,
        },
      });
    } catch (error) {
      console.log('Audit log error:', error.message);
    }

    return updatedVisit;
  }

  /**
   * Cerca visitatori esistenti per nome/cognome (per self-registration kiosk)
   */
  async searchVisitors(query: string) {
    const terms = query.split(' ').filter(Boolean);
    return this.prisma.visitor.findMany({
      where: {
        AND: terms.map((term) => ({
          OR: [
            { firstName: { contains: term } },
            { lastName: { contains: term } },
            { company: { contains: term } },
          ],
        })),
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        company: true,
      },
      take: 8,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  /**
   * Ottieni lista reparti attivi (per self-registration kiosk)
   */
  async getDepartments() {
    return this.prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true, color: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Ottieni lista host attivi (per self-registration kiosk)
   */
  async getHosts() {
    return this.prisma.host.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        departmentId: true,
        department: { select: { id: true, name: true } },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  /**
   * Self-registration: crea visitatore + visita dal kiosk
   */
  async selfRegister(dto: SelfRegisterDto) {
    // Genera PIN check-in a 4 cifre
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    // Genera QR code univoco
    const qrCode = `VIS-SELF-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Ricava departmentId dall'host se non fornito direttamente
    let departmentId = dto.departmentId;
    let hostName = dto.hostName;
    if (dto.hostId) {
      const host = await this.prisma.host.findUnique({
        where: { id: dto.hostId },
        select: { id: true, firstName: true, lastName: true, departmentId: true },
      });
      if (host) {
        hostName = hostName || `${host.firstName} ${host.lastName}`;
        if (!departmentId && host.departmentId) {
          departmentId = host.departmentId;
        }
      }
    }

    if (!departmentId) {
      throw new HttpException(
        'Impossibile determinare il reparto. Seleziona un referente con reparto assegnato.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Usa visitatore esistente o creane uno nuovo
    let visitor: any;
    if (dto.visitorId) {
      visitor = await this.prisma.visitor.findUnique({ where: { id: dto.visitorId } });
      if (!visitor) {
        throw new HttpException('Visitatore non trovato', HttpStatus.NOT_FOUND);
      }
      // Aggiorna privacy consent se non già dato
      if (!visitor.privacyConsent) {
        visitor = await this.prisma.visitor.update({
          where: { id: dto.visitorId },
          data: { privacyConsent: dto.privacyConsent },
        });
      }
    } else {
      if (!dto.firstName || !dto.lastName) {
        throw new HttpException('Nome e cognome obbligatori', HttpStatus.BAD_REQUEST);
      }
      visitor = await this.prisma.visitor.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email || null,
          company: dto.company || null,
          privacyConsent: dto.privacyConsent,
        },
      });
    }

    // Trova un admin/system user per createdById (richiesto dallo schema)
    const systemUser = await this.prisma.user.findFirst({
      where: { role: 'admin', isActive: true },
      select: { id: true },
    });

    if (!systemUser) {
      throw new HttpException(
        'Nessun utente di sistema configurato',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Crea visita
    const visit = await this.prisma.visit.create({
      data: {
        visitorId: visitor.id,
        departmentId,
        hostId: dto.hostId || null,
        hostName: hostName || null,
        visitType: dto.visitType,
        purpose: dto.purpose || null,
        scheduledDate: todayStart,
        scheduledTimeStart: now,
        status: VisitStatus.pending,
        checkInPin: pin,
        qrCode,
        createdById: systemUser.id,
      },
      include: {
        visitor: true,
        department: { select: { id: true, name: true, color: true } },
        host: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Genera badge
    const badgeNumber = this.badge.generateBadgeNumber();
    const badgeBarcode = await this.badge.generateBadgeBarcode(badgeNumber);

    // Aggiorna visita con badge e stato checked_in (registrazione = check-in immediato)
    const updatedVisit = await this.prisma.visit.update({
      where: { id: visit.id },
      data: {
        status: VisitStatus.checked_in,
        actualCheckIn: now,
        badgeNumber,
        badgeQRCode: badgeBarcode,
        badgeIssued: true,
        badgeIssuedAt: now,
      },
      include: {
        visitor: true,
        department: { select: { id: true, name: true, color: true } },
        host: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Indicizza in Meilisearch
    await this.meilisearch.indexVisit(updatedVisit);

    // Stampa badge
    try {
      const hostLabel = updatedVisit.host
        ? `${updatedVisit.host.firstName} ${updatedVisit.host.lastName}`
        : updatedVisit.hostName || null;

      const badgeData = {
        visitorName: `${visitor.firstName} ${visitor.lastName}`,
        company: visitor.company,
        badgeNumber,
        visitDate: new Date().toLocaleDateString('it-IT'),
        department: updatedVisit.department.name,
        host: hostLabel,
        qrCode: badgeBarcode,
      };
      await this.printQueue.addBadgePrintJob({
        visitId: visit.id,
        badgeData,
        copies: 1,
        priority: 1,
      });
    } catch (error) {
      console.error('Badge print error:', error.message);
    }

    // Audit log
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'check_in',
          entityType: 'visit',
          entityId: visit.id,
          details: `Self-registration kiosk: ${visitor.firstName} ${visitor.lastName}`,
          userId: null,
          ipAddress: null,
        },
      });
    } catch (error) {
      console.log('Audit log error:', error.message);
    }

    return {
      ...updatedVisit,
      visitor: {
        ...updatedVisit.visitor,
        full_name: `${visitor.firstName} ${visitor.lastName}`,
      },
    };
  }

  /**
   * Ottieni statistiche per dashboard
   */
  async getStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [current, today, scheduled, monthly] = await Promise.all([
      // Visitatori attualmente presenti
      this.prisma.visit.count({
        where: { status: VisitStatus.checked_in },
      }),
      // Visite oggi (basato su check-in effettivo, coerente con dashboard)
      this.prisma.visit.count({
        where: {
          actualCheckIn: { gte: todayStart },
        },
      }),
      // Visite programmate oggi
      this.prisma.visit.count({
        where: {
          status: { in: [VisitStatus.pending, VisitStatus.approved] },
          scheduledDate: {
            gte: todayStart,
            lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Totale visite nel mese
      this.prisma.visit.count({
        where: {
          scheduledDate: { gte: monthStart },
        },
      }),
    ]);

    return {
      current,
      today,
      scheduled,
      monthly,
    };
  }
}
