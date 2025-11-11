import { Module } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { PrintQueueService } from './print-queue.service';
import { PrinterController } from './printer.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PrinterController],
  providers: [PrinterService, PrintQueueService],
  exports: [PrinterService, PrintQueueService],
})
export class PrinterModule {}
