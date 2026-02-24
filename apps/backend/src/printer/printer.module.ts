import { Module } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { PrintQueueService } from './print-queue.service';
import { PrinterController } from './printer.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [PrismaModule, SettingsModule],
  controllers: [PrinterController],
  providers: [PrinterService, PrintQueueService],
  exports: [PrinterService, PrintQueueService],
})
export class PrinterModule {}
