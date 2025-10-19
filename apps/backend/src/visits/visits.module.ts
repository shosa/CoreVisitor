import { Module } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { VisitsController } from './visits.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MeilisearchModule } from '../meilisearch/meilisearch.module';
import { BadgeModule } from '../badge/badge.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [PrismaModule, MeilisearchModule, BadgeModule, PdfModule],
  controllers: [VisitsController],
  providers: [VisitsService],
  exports: [VisitsService],
})
export class VisitsModule {}
