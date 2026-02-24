import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const DEFAULT_COMPANY_NAME = 'Calzaturificio Emmegiemme Shoes S.r.l.';
const GDPR_PDF_PATH = 'settings/gdpr-policy.pdf';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
  ) {}

  async getSettings() {
    let settings = await this.prisma.companySettings.findFirst();
    if (!settings) {
      settings = await this.prisma.companySettings.create({
        data: { companyName: DEFAULT_COMPANY_NAME },
      });
    }
    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const existing = await this.prisma.companySettings.findFirst();
    if (existing) {
      return this.prisma.companySettings.update({
        where: { id: existing.id },
        data: { companyName: dto.companyName },
      });
    }
    return this.prisma.companySettings.create({
      data: { companyName: dto.companyName },
    });
  }

  async uploadGdprPdf(file: Express.Multer.File) {
    await this.minio.uploadRawFile(file.buffer, GDPR_PDF_PATH, 'application/pdf');

    const existing = await this.prisma.companySettings.findFirst();
    if (existing) {
      return this.prisma.companySettings.update({
        where: { id: existing.id },
        data: { gdprPdfPath: GDPR_PDF_PATH },
      });
    }
    return this.prisma.companySettings.create({
      data: { companyName: DEFAULT_COMPANY_NAME, gdprPdfPath: GDPR_PDF_PATH },
    });
  }

  async getGdprPdfUrl(): Promise<{ url: string } | null> {
    const settings = await this.prisma.companySettings.findFirst();
    if (!settings?.gdprPdfPath) {
      return null;
    }
    const url = await this.minio.getFileUrl(settings.gdprPdfPath, 3600);
    return { url };
  }
}
