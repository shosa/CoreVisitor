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
   * Contiene il badge number per identificazione univoca
   */
  async generateBadgeQRCode(badgeNumber: string): Promise<string> {
    // QR code contiene il badge number
    return await QRCode.toDataURL(badgeNumber, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
    });
  }

  /**
   * Verifica validità badge
   * Ritorna il badge number se valido
   */
  verifyBadge(qrData: string): {
    valid: boolean;
    badgeNumber?: string;
    reason?: string;
  } {
    // Il QR code contiene il badge number (formato VIS-{timestamp}-{random})
    // Verifica che sia nel formato corretto
    const badgeRegex = /^VIS-[0-9A-Z]+-[0-9A-F]{6}$/i;

    if (!badgeRegex.test(qrData)) {
      return { valid: false, reason: 'Invalid badge number format' };
    }

    return { valid: true, badgeNumber: qrData };
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
