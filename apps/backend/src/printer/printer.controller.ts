import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrinterService, PrinterConnection } from './printer.service';
import { PrintQueueService } from './print-queue.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrintJobStatus } from '@prisma/client';

@Controller('printer')
@UseGuards(JwtAuthGuard)
export class PrinterController {
  constructor(
    private printerService: PrinterService,
    private printQueueService: PrintQueueService,
    private prisma: PrismaService,
  ) {}

  /**
   * Initialize printer connection
   * POST /printer/init
   */
  @Post('init')
  @HttpCode(HttpStatus.OK)
  async initPrinter(
    @Body()
    body: {
      type: 'usb' | 'network' | 'file';
      address?: string;
      port?: number;
    },
  ) {
    const connection: PrinterConnection = {
      type: body.type,
      address: body.address,
      port: body.port,
    };

    await this.printerService.initPrinter(connection);
    return { message: 'Printer initialized successfully' };
  }

  /**
   * Print badge for visit
   * POST /printer/badge/:visitId
   */
  @Post('badge/:visitId')
  async printBadge(
    @Param('visitId') visitId: string,
    @Body()
    body?: {
      copies?: number;
      priority?: number;
      printerName?: string;
    },
  ) {
    // Get visit data
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        visitor: true,
        department: true,
        hostUser: true,
      },
    });

    if (!visit) {
      throw new Error('Visit not found');
    }

    // Prepare badge data
    const badgeData = {
      visitorName: `${visit.visitor.firstName} ${visit.visitor.lastName}`,
      company: visit.visitor.company,
      badgeNumber: visit.badgeNumber,
      visitDate: new Date(visit.scheduledDate).toLocaleDateString('it-IT'),
      department: visit.department.name,
      host: visit.hostUser
        ? `${visit.hostUser.firstName} ${visit.hostUser.lastName}`
        : visit.hostName,
      qrCode: visit.badgeQRCode,
    };

    // Add to print queue
    const jobId = await this.printQueueService.addBadgePrintJob({
      visitId,
      badgeData,
      copies: body?.copies,
      priority: body?.priority,
      printerName: body?.printerName,
    });

    return {
      message: 'Badge print job queued',
      jobId,
    };
  }

  /**
   * Test printer
   * POST /printer/test
   */
  @Post('test')
  @HttpCode(HttpStatus.OK)
  async testPrinter() {
    await this.printerService.testPrint();
    return { message: 'Test print sent successfully' };
  }

  /**
   * Get printer status
   * GET /printer/status
   */
  @Get('status')
  async getPrinterStatus() {
    const status = await this.printerService.getPrinterStatus();
    return status;
  }

  /**
   * Get print queue status
   * GET /printer/queue/status
   */
  @Get('queue/status')
  async getQueueStatus() {
    const status = await this.printQueueService.getQueueStatus();
    return status;
  }

  /**
   * Get print jobs
   * GET /printer/jobs
   */
  @Get('jobs')
  async getPrintJobs(
    @Query('status') status?: PrintJobStatus,
    @Query('visitId') visitId?: string,
    @Query('limit') limit?: string,
  ) {
    const jobs = await this.printQueueService.getPrintJobs({
      status,
      visitId,
      limit: limit ? parseInt(limit) : undefined,
    });
    return jobs;
  }

  /**
   * Retry failed print job
   * PATCH /printer/jobs/:jobId/retry
   */
  @Patch('jobs/:jobId/retry')
  @HttpCode(HttpStatus.OK)
  async retryPrintJob(@Param('jobId') jobId: string) {
    await this.printQueueService.retryPrintJob(jobId);
    return { message: 'Print job queued for retry' };
  }

  /**
   * Cancel print job
   * DELETE /printer/jobs/:jobId
   */
  @Delete('jobs/:jobId')
  @HttpCode(HttpStatus.OK)
  async cancelPrintJob(@Param('jobId') jobId: string) {
    await this.printQueueService.cancelPrintJob(jobId);
    return { message: 'Print job cancelled' };
  }

  /**
   * Cleanup old jobs
   * POST /printer/cleanup
   */
  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  async cleanupOldJobs() {
    const count = await this.printQueueService.cleanupOldJobs();
    return { message: `Cleaned up ${count} old print jobs` };
  }

  /**
   * Get printer configurations
   * GET /printer/configs
   */
  @Get('configs')
  async getPrinterConfigs() {
    const configs = await this.prisma.printerConfig.findMany({
      where: { isActive: true },
      orderBy: { isDefault: 'desc' },
    });
    return configs;
  }

  /**
   * Create printer configuration
   * POST /printer/configs
   */
  @Post('configs')
  async createPrinterConfig(
    @Body()
    body: {
      name: string;
      type?: string;
      connection?: string;
      address?: string;
      port?: number;
      isDefault?: boolean;
      settings?: any;
    },
  ) {
    // If setting as default, unset other defaults
    if (body.isDefault) {
      await this.prisma.printerConfig.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const config = await this.prisma.printerConfig.create({
      data: {
        name: body.name,
        type: body.type || 'escpos',
        connection: body.connection || 'usb',
        address: body.address,
        port: body.port,
        isDefault: body.isDefault || false,
        settings: body.settings ? JSON.stringify(body.settings) : null,
      },
    });

    return config;
  }

  /**
   * Update printer configuration
   * PATCH /printer/configs/:id
   */
  @Patch('configs/:id')
  async updatePrinterConfig(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      address?: string;
      port?: number;
      isDefault?: boolean;
      isActive?: boolean;
      settings?: any;
    },
  ) {
    // If setting as default, unset other defaults
    if (body.isDefault) {
      await this.prisma.printerConfig.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const config = await this.prisma.printerConfig.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.address && { address: body.address }),
        ...(body.port && { port: body.port }),
        ...(typeof body.isDefault !== 'undefined' && { isDefault: body.isDefault }),
        ...(typeof body.isActive !== 'undefined' && { isActive: body.isActive }),
        ...(body.settings && { settings: JSON.stringify(body.settings) }),
      },
    });

    return config;
  }

  /**
   * Delete printer configuration
   * DELETE /printer/configs/:id
   */
  @Delete('configs/:id')
  @HttpCode(HttpStatus.OK)
  async deletePrinterConfig(@Param('id') id: string) {
    await this.prisma.printerConfig.delete({
      where: { id },
    });
    return { message: 'Printer configuration deleted' };
  }
}
