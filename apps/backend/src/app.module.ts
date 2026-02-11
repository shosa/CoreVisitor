import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VisitorsModule } from './visitors/visitors.module';
import { VisitsModule } from './visits/visits.module';
import { BadgeModule } from './badge/badge.module';
import { MinioModule } from './minio/minio.module';
import { MeilisearchModule } from './meilisearch/meilisearch.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DepartmentsModule } from './departments/departments.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { KioskModule } from './kiosk/kiosk.module';
import { MobileModule } from './mobile/mobile.module';
import { PrinterModule } from './printer/printer.module';
import { ExportModule } from './export/export.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VisitorsModule,
    VisitsModule,
    BadgeModule,
    MinioModule,
    MeilisearchModule,
    NotificationsModule,
    DepartmentsModule,
    AuditLogsModule,
    KioskModule,
    MobileModule,
    PrinterModule,
    ExportModule,
  ],
})
export class AppModule {}
