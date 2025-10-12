import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  constructor(private configService: ConfigService) {}

  /**
   * Invia notifica host quando visitatore arriva
   * (Preparato per futuro - ora solo log)
   */
  async notifyHostVisitorArrival(visit: any) {
    const enabled = this.configService.get('NOTIFICATIONS_ENABLED') === 'true';

    if (!enabled) {
      console.log(`📧 [NOTIFICATIONS DISABLED] Would notify ${visit.host.email} about visitor arrival`);
      return { sent: false, reason: 'Notifications disabled in settings' };
    }

    // TODO: Implementare invio email/push quando abilitato
    console.log(`📧 Notifying ${visit.host.email} about visitor: ${visit.visitor.firstName} ${visit.visitor.lastName}`);

    return { sent: true };
  }

  /**
   * Invia notifica visita programmata
   */
  async notifyScheduledVisit(visit: any) {
    const enabled = this.configService.get('NOTIFICATIONS_ENABLED') === 'true';

    if (!enabled) {
      console.log(`📧 [NOTIFICATIONS DISABLED] Would notify about scheduled visit`);
      return { sent: false, reason: 'Notifications disabled in settings' };
    }

    // TODO: Implementare invio email/push quando abilitato
    console.log(`📧 Notifying about scheduled visit for ${visit.scheduledDate}`);

    return { sent: true };
  }
}
