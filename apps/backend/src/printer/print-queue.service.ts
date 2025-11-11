import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrinterService, BadgePrintData } from './printer.service';
import { PrintJobStatus, PrintJobType } from '@prisma/client';

@Injectable()
export class PrintQueueService implements OnModuleInit {
  private readonly logger = new Logger(PrintQueueService.name);
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout;

  constructor(
    private prisma: PrismaService,
    private printerService: PrinterService,
  ) {}

  async onModuleInit() {
    // Try to auto-initialize default printer
    await this.initializeDefaultPrinter();

    // Start queue processor every 5 seconds
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 5000);

    this.logger.log('Print queue service initialized');
  }

  /**
   * Auto-initialize default printer configuration
   */
  private async initializeDefaultPrinter() {
    try {
      const defaultConfig = await this.prisma.printerConfig.findFirst({
        where: { isDefault: true, isActive: true },
      });

      if (defaultConfig) {
        this.logger.log(`Auto-initializing default printer: ${defaultConfig.name}`);
        await this.printerService.initPrinter({
          type: defaultConfig.connection as 'usb' | 'network' | 'file',
          address: defaultConfig.address || undefined,
          port: defaultConfig.port || undefined,
        });
        this.logger.log('Default printer initialized successfully');
      } else {
        this.logger.warn('No default printer configured. Printer must be initialized manually.');
      }
    } catch (error) {
      this.logger.warn(`Failed to auto-initialize printer: ${error.message}. Printer must be initialized manually.`);
    }
  }

  /**
   * Add badge print job to queue
   */
  async addBadgePrintJob(data: {
    visitId: string;
    badgeData: BadgePrintData;
    printerName?: string;
    copies?: number;
    priority?: number;
    createdById?: string;
  }): Promise<string> {
    try {
      const printJob = await this.prisma.printJob.create({
        data: {
          type: PrintJobType.badge,
          status: PrintJobStatus.pending,
          visitId: data.visitId,
          printerName: data.printerName,
          data: JSON.stringify(data.badgeData),
          template: 'badge_default',
          copies: data.copies || 1,
          priority: data.priority || 0,
          createdById: data.createdById,
        },
      });

      this.logger.log(`Print job created: ${printJob.id} for visit: ${data.visitId}`);
      return printJob.id;
    } catch (error) {
      this.logger.error(`Failed to create print job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process print queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return; // Already processing
    }

    try {
      this.isProcessing = true;

      // Get pending jobs ordered by priority and creation date
      const pendingJobs = await this.prisma.printJob.findMany({
        where: {
          status: PrintJobStatus.pending,
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        take: 5, // Process max 5 jobs at a time
      });

      if (pendingJobs.length === 0) {
        return;
      }

      this.logger.log(`Processing ${pendingJobs.length} print jobs`);

      for (const job of pendingJobs) {
        await this.processPrintJob(job.id);
      }
    } catch (error) {
      this.logger.error(`Queue processing error: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process single print job
   */
  async processPrintJob(jobId: string): Promise<void> {
    try {
      // Update status to printing
      await this.prisma.printJob.update({
        where: { id: jobId },
        data: { status: PrintJobStatus.printing },
      });

      const job = await this.prisma.printJob.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        throw new Error('Print job not found');
      }

      // Parse job data
      const badgeData: BadgePrintData = JSON.parse(job.data);

      // Print badge (repeat for number of copies)
      for (let i = 0; i < job.copies; i++) {
        await this.printerService.printBadge(badgeData);
      }

      // Update status to completed
      await this.prisma.printJob.update({
        where: { id: jobId },
        data: {
          status: PrintJobStatus.completed,
          printedAt: new Date(),
        },
      });

      // Update visit badge_issued status
      if (job.visitId) {
        await this.prisma.visit.update({
          where: { id: job.visitId },
          data: {
            badgeIssued: true,
            badgeIssuedAt: new Date(),
          },
        });
      }

      this.logger.log(`Print job completed: ${jobId}`);
    } catch (error) {
      this.logger.error(`Print job ${jobId} failed: ${error.message}`);

      // Update status to failed
      await this.prisma.printJob.update({
        where: { id: jobId },
        data: {
          status: PrintJobStatus.failed,
          error: error.message,
        },
      });
    }
  }

  /**
   * Cancel print job
   */
  async cancelPrintJob(jobId: string): Promise<void> {
    try {
      await this.prisma.printJob.update({
        where: { id: jobId },
        data: { status: PrintJobStatus.cancelled },
      });

      this.logger.log(`Print job cancelled: ${jobId}`);
    } catch (error) {
      this.logger.error(`Failed to cancel print job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get print queue status
   */
  async getQueueStatus(): Promise<{
    pending: number;
    printing: number;
    completed: number;
    failed: number;
  }> {
    try {
      const [pending, printing, completed, failed] = await Promise.all([
        this.prisma.printJob.count({ where: { status: PrintJobStatus.pending } }),
        this.prisma.printJob.count({ where: { status: PrintJobStatus.printing } }),
        this.prisma.printJob.count({ where: { status: PrintJobStatus.completed } }),
        this.prisma.printJob.count({ where: { status: PrintJobStatus.failed } }),
      ]);

      return { pending, printing, completed, failed };
    } catch (error) {
      this.logger.error(`Failed to get queue status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get print jobs
   */
  async getPrintJobs(params: {
    status?: PrintJobStatus;
    visitId?: string;
    limit?: number;
  }) {
    return this.prisma.printJob.findMany({
      where: {
        ...(params.status && { status: params.status }),
        ...(params.visitId && { visitId: params.visitId }),
      },
      orderBy: { createdAt: 'desc' },
      take: params.limit || 50,
    });
  }

  /**
   * Retry failed job
   */
  async retryPrintJob(jobId: string): Promise<void> {
    try {
      await this.prisma.printJob.update({
        where: { id: jobId },
        data: {
          status: PrintJobStatus.pending,
          error: null,
        },
      });

      this.logger.log(`Print job ${jobId} queued for retry`);
    } catch (error) {
      this.logger.error(`Failed to retry print job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cleanup old completed jobs (older than 7 days)
   */
  async cleanupOldJobs(): Promise<number> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const result = await this.prisma.printJob.deleteMany({
        where: {
          status: PrintJobStatus.completed,
          createdAt: { lt: sevenDaysAgo },
        },
      });

      this.logger.log(`Cleaned up ${result.count} old print jobs`);
      return result.count;
    } catch (error) {
      this.logger.error(`Failed to cleanup old jobs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cleanup on module destroy
   */
  onModuleDestroy() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
  }
}
