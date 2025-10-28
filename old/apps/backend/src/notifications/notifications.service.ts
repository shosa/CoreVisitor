import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private transporter;

  constructor(private configService: ConfigService) {
    const enabled = this.configService.get('NOTIFICATIONS_ENABLED') === 'true';
    if (enabled) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST'),
        port: parseInt(this.configService.get('SMTP_PORT')),
        secure: this.configService.get('SMTP_SECURE') === 'true',
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASSWORD'),
        },
      });
    }
  }

  private async sendEmail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      console.log(`📧 [NOTIFICATIONS DISABLED] Would send email to ${to} with subject "${subject}"`);
      return { sent: false, reason: 'Notifications disabled in settings' };
    }

    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        to,
        subject,
        html,
      });
      console.log(`📧 Email sent to ${to} with subject "${subject}"`);
      return { sent: true };
    } catch (error) {
      console.error(`Failed to send email to ${to}`, error);
      return { sent: false, reason: 'Failed to send email' };
    }
  }

  async notifyHostVisitorArrival(visit: any) {
    const subject = `Il tuo visitatore è arrivato`;
    const html = `
      <p>Ciao ${visit.host.name},</p>
      <p>Il tuo visitatore, <strong>${visit.visitor.firstName} ${visit.visitor.lastName}</strong>, è appena arrivato e ha effettuato il check-in.</p>
      <p>Dettagli della visita:</p>
      <ul>
        <li><strong>Azienda:</strong> ${visit.visitor.company}</li>
        <li><strong>Scopo:</strong> ${visit.purpose}</li>
        <li><strong>Orario di arrivo:</strong> ${new Date(visit.checkInTime).toLocaleString()}</li>
      </ul>
      <p>Cordiali saluti,</p>
      <p>Il team di CoreVisitor</p>
    `;

    return this.sendEmail(visit.host.email, subject, html);
  }

  async notifyScheduledVisit(visit: any) {
    const subject = `Nuova visita programmata`;
    const html = `
      <p>Ciao,</p>
      <p>Una nuova visita è stata programmata:</p>
      <ul>
        <li><strong>Visitatore:</strong> ${visit.visitor.firstName} ${visit.visitor.lastName}</li>
        <li><strong>Azienda:</strong> ${visit.visitor.company}</li>
        <li><strong>Ospite:</strong> ${visit.host.name}</li>
        <li><strong>Data e ora:</strong> ${new Date(visit.scheduledDate).toLocaleString()}</li>
      </ul>
      <p>Cordiali saluti,</p>
      <p>Il team di CoreVisitor</p>
    `;

    // This should probably go to the host and maybe the visitor
    return this.sendEmail(visit.host.email, subject, html);
  }
}
