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
import { PdfModule } from './pdf/pdf.module';

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
    PdfModule,
  ],
})
export class AppModule {}
