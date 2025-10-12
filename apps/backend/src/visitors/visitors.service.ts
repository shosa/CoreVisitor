import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeilisearchService } from '../meilisearch/meilisearch.service';
import { MinioService } from '../minio/minio.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';

@Injectable()
export class VisitorsService {
  constructor(
    private prisma: PrismaService,
    private meilisearch: MeilisearchService,
    private minio: MinioService,
  ) {}

  async create(
    createVisitorDto: CreateVisitorDto,
    documentFile?: Express.Multer.File,
    photoFile?: Express.Multer.File,
  ) {
    // Crea visitatore
    const visitor = await this.prisma.visitor.create({
      data: {
        ...createVisitorDto,
        privacyConsentDate: createVisitorDto.privacyConsent
          ? new Date()
          : null,
      },
    });

    // Upload documenti se presenti
    if (documentFile) {
      const documentPath = await this.minio.uploadFile(
        documentFile,
        visitor.id,
        'document',
      );
      await this.prisma.visitor.update({
        where: { id: visitor.id },
        data: { documentScanPath: documentPath },
      });
    }

    if (photoFile) {
      const photoPath = await this.minio.uploadFile(
        photoFile,
        visitor.id,
        'photo',
      );
      await this.prisma.visitor.update({
        where: { id: visitor.id },
        data: { photoPath: photoPath },
      });
    }

    // Indicizza in Meilisearch
    await this.meilisearch.indexVisitor(visitor);

    return visitor;
  }

  async findAll(search?: string, company?: string) {
    if (search) {
      // Cerca con Meilisearch
      const filters = company ? `company = "${company}"` : undefined;
      const results = await this.meilisearch.searchVisitors(search, filters);
      return results.hits;
    }

    // Query normale
    return this.prisma.visitor.findMany({
      where: company ? { company } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findOne(id: string) {
    const visitor = await this.prisma.visitor.findUnique({
      where: { id },
      include: {
        visits: {
          include: {
            host: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { scheduledDate: 'desc' },
        },
      },
    });

    if (!visitor) {
      throw new NotFoundException(`Visitor ${id} not found`);
    }

    return visitor;
  }

  async update(id: string, updateVisitorDto: UpdateVisitorDto) {
    const visitor = await this.prisma.visitor.update({
      where: { id },
      data: updateVisitorDto,
    });

    // Aggiorna indice
    await this.meilisearch.indexVisitor(visitor);

    return visitor;
  }

  async remove(id: string) {
    const visitor = await this.findOne(id);

    // Elimina file da MinIO
    if (visitor.documentScanPath) {
      await this.minio.deleteFile(visitor.documentScanPath);
    }
    if (visitor.photoPath) {
      await this.minio.deleteFile(visitor.photoPath);
    }

    // Elimina da database
    await this.prisma.visitor.delete({ where: { id } });

    // Elimina da indice
    await this.meilisearch.deleteVisitor(id);

    return { message: 'Visitor deleted successfully' };
  }

  async getDocumentUrl(id: string) {
    const visitor = await this.findOne(id);
    if (!visitor.documentScanPath) {
      throw new NotFoundException('Document not found');
    }
    return await this.minio.getFileUrl(visitor.documentScanPath);
  }

  async getPhotoUrl(id: string) {
    const visitor = await this.findOne(id);
    if (!visitor.photoPath) {
      throw new NotFoundException('Photo not found');
    }
    return await this.minio.getFileUrl(visitor.photoPath);
  }
}
