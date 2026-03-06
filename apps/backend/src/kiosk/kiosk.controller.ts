import { Controller, Get, Post, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { KioskService } from './kiosk.service';
import { SettingsService } from '../settings/settings.service';
import { SelfRegisterDto } from './dto/self-register.dto';

@Controller('kiosk')
export class KioskController {
  constructor(
    private readonly kioskService: KioskService,
    private readonly settingsService: SettingsService,
  ) {}

  /**
   * Verifica PIN per self check-in
   * POST /api/kiosk/verify-pin
   */
  @Post('verify-pin')
  async verifyPin(@Body() body: { pin: string }) {
    try {
      const { pin } = body;

      if (!pin) {
        throw new HttpException('PIN is required', HttpStatus.BAD_REQUEST);
      }

      if (!/^\d{4}$/.test(pin)) {
        throw new HttpException('PIN must be 4 digits', HttpStatus.BAD_REQUEST);
      }

      const visit = await this.kioskService.verifyPin(pin);

      if (!visit) {
        return {
          status: 'error',
          message: 'PIN non valido o visita non trovata',
        };
      }

      return { status: 'success', data: visit };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error verifying PIN',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verifica validità badge QR code
   * POST /api/kiosk/verify-badge
   */
  @Post('verify-badge')
  async verifyBadge(@Body() body: { badge_code: string }) {
    try {
      const { badge_code } = body;

      if (!badge_code) {
        throw new HttpException('Badge code is required', HttpStatus.BAD_REQUEST);
      }

      const visit = await this.kioskService.verifyBadge(badge_code);

      if (!visit) {
        return { status: 'error', message: 'Badge non valido o scaduto' };
      }

      return { status: 'success', data: visit };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error verifying badge',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Self check-in con PIN
   * POST /api/kiosk/check-in
   */
  @Post('check-in')
  async checkIn(@Body() body: { pin: string }) {
    try {
      const { pin } = body;

      if (!pin) {
        throw new HttpException('PIN is required', HttpStatus.BAD_REQUEST);
      }

      const result = await this.kioskService.checkInWithPin(pin);

      return {
        status: 'success',
        message: 'Check-in effettuato con successo',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error during check-in',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Check-out visitatore da QR code
   * POST /api/kiosk/check-out
   */
  @Post('check-out')
  async checkOut(@Body() body: { visit_id: string; badge_code: string }) {
    try {
      const { visit_id, badge_code } = body;

      if (!visit_id || !badge_code) {
        throw new HttpException('Visit ID and badge code are required', HttpStatus.BAD_REQUEST);
      }

      const result = await this.kioskService.checkOut(visit_id, badge_code);

      return {
        status: 'success',
        message: 'Check-out effettuato con successo',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error during check-out',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Salva firma visitatore da kiosk (base64 PNG)
   * POST /api/kiosk/upload-signature
   */
  @Post('upload-signature')
  async uploadSignature(@Body() body: { visitorId: string; signatureBase64: string }) {
    try {
      const { visitorId, signatureBase64 } = body;
      if (!visitorId || !signatureBase64) {
        throw new HttpException('visitorId e signatureBase64 sono obbligatori', HttpStatus.BAD_REQUEST);
      }
      await this.kioskService.uploadSignature(visitorId, signatureBase64);
      return { status: 'success', message: 'Firma salvata con successo' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Errore durante il salvataggio della firma',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Ottieni lista reparti attivi per kiosk
   * GET /api/kiosk/departments
   */
  @Get('departments')
  async getDepartments() {
    try {
      const departments = await this.kioskService.getDepartments();
      return { status: 'success', data: departments };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching departments',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Ottieni lista host attivi (referenti interni) per kiosk
   * GET /api/kiosk/hosts
   */
  @Get('hosts')
  async getHosts() {
    try {
      const hosts = await this.kioskService.getHosts();
      return { status: 'success', data: hosts };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching hosts',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Ricerca visitatori esistenti per nome/cognome (per self-registration kiosk)
   * GET /api/kiosk/visitors/search?q=mario
   */
  @Get('visitors/search')
  async searchVisitors(@Query('q') q: string) {
    try {
      if (!q || q.trim().length < 2) {
        return { status: 'success', data: [] };
      }
      const visitors = await this.kioskService.searchVisitors(q.trim());
      return { status: 'success', data: visitors };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error searching visitors',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Self-registration dal kiosk: crea visitatore + visita + stampa badge
   * POST /api/kiosk/self-register
   */
  @Post('self-register')
  async selfRegister(@Body() dto: SelfRegisterDto) {
    try {
      if (!dto.visitorId && (!dto.firstName || !dto.lastName)) {
        throw new HttpException('Nome e cognome obbligatori per nuovo visitatore', HttpStatus.BAD_REQUEST);
      }
      if (!dto.privacyConsent) {
        throw new HttpException('Consenso privacy obbligatorio', HttpStatus.BAD_REQUEST);
      }

      const result = await this.kioskService.selfRegister(dto);
      return {
        status: 'success',
        message: 'Registrazione completata con successo',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error during self-registration',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Ottieni impostazioni pubbliche aziendali (nome azienda)
   * GET /api/kiosk/settings
   */
  @Get('settings')
  async getPublicSettings() {
    const settings = await this.settingsService.getSettings();
    return {
      status: 'success',
      data: { companyName: settings.companyName },
    };
  }

  /**
   * Ottieni statistiche per dashboard kiosk
   * GET /api/kiosk/stats
   */
  @Get('stats')
  async getStats() {
    try {
      const stats = await this.kioskService.getStats();
      return { status: 'success', data: stats };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching stats',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
