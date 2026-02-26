import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bwipjs from 'bwip-js';
import { randomBytes } from 'crypto';

@Injectable()
export class BadgeService {
  constructor(private configService: ConfigService) {}

  /**
   * Genera numero badge univoco a 6 cifre numeriche
   */
  generateBadgeNumber(): string {
    // Genera 6 cifre casuali: prime 2 dall'ora corrente, ultime 4 random
    const hour = new Date().getHours().toString().padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    return `${hour}${random}`;
  }

  /**
   * Genera codice a barre per badge
   * Contiene il badge number per identificazione univoca
   * Usa il formato CODE128 che è ottimo per alfanumerici
   */
  async generateBadgeBarcode(badgeNumber: string): Promise<string> {
    try {
      // Genera codice a barre in formato CODE128
      const png = await bwipjs.toBuffer({
        bcid: 'code128',       // Tipo di codice a barre
        text: badgeNumber,      // Testo da codificare
        scale: 3,               // Scala (risoluzione)
        height: 10,             // Altezza delle barre in mm
        includetext: true,      // Include il testo sotto il codice
        textxalign: 'center',   // Allineamento testo
      });

      // Converti in base64 per il data URL
      return `data:image/png;base64,${png.toString('base64')}`;
    } catch (error) {
      throw new Error(`Failed to generate barcode: ${error.message}`);
    }
  }

  /**
   * Verifica validità badge
   * Ritorna il badge number se valido
   */
  verifyBadge(barcodeData: string): {
    valid: boolean;
    badgeNumber?: string;
    reason?: string;
  } {
    // Accetta numeri a 6 cifre
    const badgeRegex = /^\d{6}$/;

    if (!badgeRegex.test(barcodeData)) {
      return { valid: false, reason: 'Invalid badge number format' };
    }

    return { valid: true, badgeNumber: barcodeData };
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
      parseInt(this.configService.get('BADGE_EXPIRY_HOURS')) || 24;
    return new Date(now.getTime() + hours * 60 * 60 * 1000);
  }
}
