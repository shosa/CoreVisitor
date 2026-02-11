import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { KioskService } from './kiosk.service';

@Controller('kiosk')
export class KioskController {
  constructor(private readonly kioskService: KioskService) {}

  /**
   * Verifica PIN per self check-in
   * POST /api/kiosk/verify-pin
   */
  @Post('verify-pin')
  async verifyPin(@Body() body: { pin: string }) {
    try {
      const { pin } = body;

      if (!pin) {
        throw new HttpException(
          'PIN is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate PIN format (4 digits)
      if (!/^\d{4}$/.test(pin)) {
        throw new HttpException(
          'PIN must be 4 digits',
          HttpStatus.BAD_REQUEST,
        );
      }

      const visit = await this.kioskService.verifyPin(pin);

      if (!visit) {
        return {
          status: 'error',
          message: 'PIN non valido o visita non trovata',
        };
      }

      return {
        status: 'success',
        data: visit,
      };
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
        throw new HttpException(
          'Badge code is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const visit = await this.kioskService.verifyBadge(badge_code);

      if (!visit) {
        return {
          status: 'error',
          message: 'Badge non valido o scaduto',
        };
      }

      return {
        status: 'success',
        data: visit,
      };
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
        throw new HttpException(
          'PIN is required',
          HttpStatus.BAD_REQUEST,
        );
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
        throw new HttpException(
          'Visit ID and badge code are required',
          HttpStatus.BAD_REQUEST,
        );
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
   * Ottieni statistiche per dashboard kiosk
   * GET /api/kiosk/stats
   */
  @Get('stats')
  async getStats() {
    try {
      const stats = await this.kioskService.getStats();

      return {
        status: 'success',
        data: stats,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching stats',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
