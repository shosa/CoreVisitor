import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { VisitStatus } from '@prisma/client';

@Controller('export')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  /**
   * GET /api/export/visits
   * Genera PDF registro visite
   * Query params: dateFrom, dateTo, status
   */
  @Get('visits')
  @Roles('admin', 'receptionist')
  async exportVisits(
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Query('status') status: VisitStatus,
    @Res() res: Response,
  ) {
    const buffer = await this.exportService.generateVisitsReport(
      dateFrom,
      dateTo,
      status,
    );

    const filename = `registro-visite-${dateFrom || 'tutti'}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });

    res.end(buffer);
  }

  /**
   * GET /api/export/visitors
   * Genera PDF elenco visitatori
   */
  @Get('visitors')
  @Roles('admin', 'receptionist')
  async exportVisitors(@Res() res: Response) {
    const buffer = await this.exportService.generateVisitorsReport();

    const filename = `elenco-visitatori-${new Date().toISOString().split('T')[0]}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });

    res.end(buffer);
  }
}
