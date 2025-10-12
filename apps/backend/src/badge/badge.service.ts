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
   * Contiene: badgeNumber, visitorId, visitId, validUntil
   */
  async generateBadgeQRCode(data: {
    badgeNumber: string;
    visitorId: string;
    visitId: string;
    validUntil: Date;
  }): Promise<string> {
    const qrData = JSON.stringify({
      badge: data.badgeNumber,
      visitor: data.visitorId,
      visit: data.visitId,
      validUntil: data.validUntil.toISOString(),
      issuer: 'CoreVisitor',
    });

    // Genera QR code come data URL (base64)
    return await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
    });
  }

  /**
   * Verifica validità badge
   */
  verifyBadge(qrData: string): {
    valid: boolean;
    data?: any;
    reason?: string;
  } {
    try {
      const parsed = JSON.parse(qrData);

      if (parsed.issuer !== 'CoreVisitor') {
        return { valid: false, reason: 'Invalid issuer' };
      }

      const validUntil = new Date(parsed.validUntil);
      if (validUntil < new Date()) {
        return { valid: false, reason: 'Badge expired' };
      }

      return { valid: true, data: parsed };
    } catch (error) {
      return { valid: false, reason: 'Invalid QR code' };
    }
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
