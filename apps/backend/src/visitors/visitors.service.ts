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
    console.log('🔍 CREATE VISITOR - DTO:', createVisitorDto);
    console.log('🔍 CREATE VISITOR - documentFile:', documentFile ? `${documentFile.originalname} (${documentFile.size} bytes)` : 'NULL');
    console.log('🔍 CREATE VISITOR - photoFile:', photoFile ? `${photoFile.originalname} (${photoFile.size} bytes)` : 'NULL');

    // Crea visitatore
    const visitor = await this.prisma.visitor.create({
      data: {
        ...createVisitorDto,
        documentExpiry: createVisitorDto.documentExpiry
          ? new Date(createVisitorDto.documentExpiry)
          : undefined,
      },
    });

    console.log('✅ Visitor created:', visitor.id);

    // Upload documenti se presenti
    if (documentFile) {
      console.log('📄 Uploading document file...');
      const documentPath = await this.minio.uploadFile(
        documentFile,
        visitor.id,
        'document',
      );
      console.log('📄 Document uploaded to MinIO:', documentPath);

      // Create visitor document record
      await this.prisma.visitorDocument.create({
        data: {
          visitorId: visitor.id,
          fileName: documentFile.originalname,
          filePath: documentPath,
          fileSize: documentFile.size,
          mimeType: documentFile.mimetype,
        },
      });
      console.log('✅ Document record created in DB');
    }

    if (photoFile) {
      console.log('📷 Uploading photo file...');
      const photoPath = await this.minio.uploadFile(
        photoFile,
        visitor.id,
        'photo',
      );
      console.log('📷 Photo uploaded to MinIO:', photoPath);

      await this.prisma.visitor.update({
        where: { id: visitor.id },
        data: { photoPath: photoPath },
      });
      console.log('✅ Photo path saved in DB');
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
            hostUser: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { scheduledDate: 'desc' },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
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
      data: {
        ...updateVisitorDto,
        documentExpiry: updateVisitorDto.documentExpiry
          ? new Date(updateVisitorDto.documentExpiry)
          : undefined,
      },
    });

    // Aggiorna indice
    await this.meilisearch.indexVisitor(visitor);

    return visitor;
  }

  async remove(id: string) {
    const visitor = await this.findOne(id);

    // Elimina file da MinIO
    if (visitor.photoPath) {
      await this.minio.deleteFile(visitor.photoPath);
    }

    // Elimina da database (cascade deletes documents)
    await this.prisma.visitor.delete({ where: { id } });

    // Elimina da indice
    await this.meilisearch.deleteVisitor(id);

    return { message: 'Visitor deleted successfully' };
  }

  async getDocumentUrl(id: string) {
    const document = await this.prisma.visitorDocument.findFirst({
      where: { visitorId: id },
      orderBy: { uploadedAt: 'desc' },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    const url = await this.minio.getFileUrl(document.filePath);
    return { url };
  }

  async getPhotoUrl(id: string) {
    const visitor = await this.findOne(id);
    if (!visitor.photoPath) {
      throw new NotFoundException('Photo not found');
    }
    const url = await this.minio.getFileUrl(visitor.photoPath);
    return { url };
  }
}
