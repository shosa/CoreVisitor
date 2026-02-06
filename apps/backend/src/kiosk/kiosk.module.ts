import { Module } from '@nestjs/common';
import { KioskController } from './kiosk.controller';
import { KioskService } from './kiosk.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BadgeModule } from '../badge/badge.module';
import { PrinterModule } from '../printer/printer.module';
import { MeilisearchModule } from '../meilisearch/meilisearch.module';

@Module({
  imports: [PrismaModule, BadgeModule, PrinterModule, MeilisearchModule],
  controllers: [KioskController],
  providers: [KioskService],
  exports: [KioskService],
})
export class KioskModule {}
