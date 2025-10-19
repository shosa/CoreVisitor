import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import { randomBytes } from 'crypto';

@Injectable()
export class BadgeService {
  constructor(private configService: ConfigService) {}

  /**
   * Genera numero badge univoco
   */
  generateBadgeNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = randomBytes(3).toString('hex').toUpperCase();
    return `VIS-${timestamp}-${random}`;
  }

  /**
   * Genera QR code per badge
   * Contiene solo l'ID della visita per compatibilità con lettori esterni
   */
  async generateBadgeQRCode(visitId: string): Promise<string> {
    // QR code contiene solo l'ID visita (semplice stringa)
    return await QRCode.toDataURL(visitId, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
    });
  }

  /**
   * Verifica validità badge
   * Ritorna l'ID visita se valido
   */
  verifyBadge(qrData: string): {
    valid: boolean;
    visitId?: string;
    reason?: string;
  } {
    // Il QR code contiene solo l'ID visita (UUID)
    // Verifica che sia un UUID valido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(qrData)) {
      return { valid: false, reason: 'Invalid visit ID format' };
    }

    return { valid: true, visitId: qrData };
  }

  /**
   * Calcola data scadenza badge
   */
  calculateBadgeExpiry(scheduledEndDate?: Date): Date {
    const now = new Date();
    if (scheduledEndDate && scheduledEndDate > now) {
      return scheduledEndDate;
    }

    // Default: badge valido per durata configurata
    const hours =
      parseInt(this.configService.get('QR_CODE_EXPIRY_HOURS')) || 24;
    return new Date(now.getTime() + hours * 60 * 60 * 1000);
  }
}
