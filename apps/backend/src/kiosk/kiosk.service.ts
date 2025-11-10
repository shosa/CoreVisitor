import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KioskService {
  constructor(private prisma: PrismaService) {}

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
        status: 'checked_in', // Solo visite con check-in attivo
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

    if (visit.status !== 'checked_in') {
      throw new HttpException(
        `Impossibile effettuare check-out. Stato attuale: ${visit.status}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Effettua check-out
    const updatedVisit = await this.prisma.visit.update({
      where: { id: visitId },
      data: {
        status: 'checked_out',
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
      },
    });

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
        status: 'checked_in',
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

    // Visitatori attualmente presenti
    const current = await this.prisma.visit.count({
      where: {
        status: 'checked_in',
      },
    });

    // Visite oggi
    const today = await this.prisma.visit.count({
      where: {
        createdAt: {
          gte: todayStart,
        },
      },
    });

    // Visite programmate oggi
    const scheduled = await this.prisma.visit.count({
      where: {
        status: 'approved',
        scheduledDate: {
          gte: todayStart,
          lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    // Totale visite nel mese
    const monthly = await this.prisma.visit.count({
      where: {
        createdAt: {
          gte: monthStart,
        },
      },
    });

    return {
      current,
      today,
      scheduled,
      monthly,
    };
  }
}
