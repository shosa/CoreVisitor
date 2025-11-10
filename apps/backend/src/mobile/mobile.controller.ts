import { Controller, Post, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { MobileService } from './mobile.service';

@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  /**
   * Login unificato per tutte le app mobile CoreSuite
   * POST /api/mobile/login
   */
  @Post('login')
  async handleAction(
    @Body() body: { action: string; username?: string; password?: string; app_type?: string; user_id?: string },
    @Headers('x-app-type') appType?: string,
  ) {
    try {
      const { action, username, password, user_id } = body;
      const finalAppType = body.app_type || appType || 'visitor-kiosk';

      switch (action) {
        case 'login':
          if (!username || !password) {
            throw new HttpException(
              'Username and password are required',
              HttpStatus.BAD_REQUEST,
            );
          }
          return await this.mobileService.login(username, password, finalAppType);

        case 'get_users':
          return await this.mobileService.getUsers(finalAppType);

        case 'profile':
          if (!user_id) {
            throw new HttpException(
              'User ID is required',
              HttpStatus.BAD_REQUEST,
            );
          }
          return await this.mobileService.getProfile(user_id, finalAppType);

        default:
          throw new HttpException(
            'Invalid action',
            HttpStatus.BAD_REQUEST,
          );
      }
    } catch (error) {
      throw new HttpException(
        error.message || 'Error processing request',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
