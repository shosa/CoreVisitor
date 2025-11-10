import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { KioskService } from './kiosk.service';

@Controller('kiosk')
export class KioskController {
  constructor(private readonly kioskService: KioskService) {}

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
   * Ottieni visitatori attualmente presenti
   * GET /api/kiosk/current-visitors
   */
  @Get('current-visitors')
  async getCurrentVisitors() {
    try {
      const visitors = await this.kioskService.getCurrentVisitors();

      return {
        status: 'success',
        data: visitors,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching current visitors',
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
