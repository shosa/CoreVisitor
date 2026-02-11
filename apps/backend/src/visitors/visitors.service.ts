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
  ) {
    // Crea visitatore
    const visitor = await this.prisma.visitor.create({
      data: {
        ...createVisitorDto,
        documentExpiry: createVisitorDto.documentExpiry
          ? new Date(createVisitorDto.documentExpiry)
          : undefined,
      },
    });

    // Upload documento se presente
    if (documentFile) {
      const documentPath = await this.minio.uploadFile(
        documentFile,
        visitor.id,
        'document',
      );

      await this.prisma.visitorDocument.create({
        data: {
          visitorId: visitor.id,
          fileName: documentFile.originalname,
          filePath: documentPath,
          fileSize: documentFile.size,
          mimeType: documentFile.mimetype,
        },
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

    // Elimina tutti i file documenti da MinIO
    if (visitor.documents && visitor.documents.length > 0) {
      for (const doc of visitor.documents) {
        try {
          await this.minio.deleteFile(doc.filePath);
        } catch (error) {
          console.error(`Failed to delete document file ${doc.filePath}:`, error.message);
        }
      }
    }

    // Elimina anche le visite correlate da Meilisearch
    if (visitor.visits && visitor.visits.length > 0) {
      for (const visit of visitor.visits) {
        try {
          await this.meilisearch.deleteVisit(visit.id);
        } catch (error) {
          console.error(`Failed to delete visit ${visit.id} from Meilisearch:`, error.message);
        }
      }
    }

    // Elimina da database (cascade deletes documents e visits)
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

}
