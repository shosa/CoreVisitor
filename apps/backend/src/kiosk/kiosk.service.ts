import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeService } from '../badge/badge.service';
import { PrintQueueService } from '../printer/print-queue.service';
import { MeilisearchService } from '../meilisearch/meilisearch.service';
import { VisitStatus } from '@prisma/client';

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
            photoPath: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        hostUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
        hostUser: true,
      },
    });

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
        host: updatedVisit.hostUser
          ? `${updatedVisit.hostUser.firstName} ${updatedVisit.hostUser.lastName}`
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
            photoPath: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        hostUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
   * Ottieni lista visitatori attualmente presenti
   */
  async getCurrentVisitors() {
    const visits = await this.prisma.visit.findMany({
      where: {
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
            photoPath: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        hostUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        actualCheckIn: 'desc',
      },
    });

    // Aggiungi full_name ai visitors
    return visits.map((visit) => ({
      ...visit,
      visitor: {
        ...visit.visitor,
        full_name: `${visit.visitor.firstName} ${visit.visitor.lastName}`,
      },
    }));
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
