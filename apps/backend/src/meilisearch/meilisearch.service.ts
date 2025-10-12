import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch, Index } from 'meilisearch';

@Injectable()
export class MeilisearchService implements OnModuleInit {
  private client: MeiliSearch;
  private visitorsIndex: Index;
  private visitsIndex: Index;

  constructor(private configService: ConfigService) {
    this.client = new MeiliSearch({
      host: this.configService.get('MEILISEARCH_HOST'),
      apiKey: this.configService.get('MEILISEARCH_API_KEY'),
    });
  }

  async onModuleInit() {
    try {
      // Crea indici
      this.visitorsIndex = this.client.index('visitors');
      this.visitsIndex = this.client.index('visits');

      // Configura attributi ricercabili
      await this.visitorsIndex.updateSettings({
        searchableAttributes: [
          'firstName',
          'lastName',
          'email',
          'phone',
          'company',
          'documentNumber',
        ],
        filterableAttributes: ['company', 'createdAt'],
        sortableAttributes: ['createdAt', 'lastName'],
      });

      await this.visitsIndex.updateSettings({
        searchableAttributes: [
          'visitorName',
          'hostName',
          'department',
          'badgeNumber',
        ],
        filterableAttributes: [
          'status',
          'purpose',
          'scheduledDate',
          'checkInTime',
        ],
        sortableAttributes: ['scheduledDate', 'checkInTime'],
      });

      console.log('✅ Meilisearch indexes configured');
    } catch (error) {
      console.error('❌ Meilisearch setup error:', error.message);
    }
  }

  /**
   * Indicizza visitatore
   */
  async indexVisitor(visitor: any) {
    try {
      await this.visitorsIndex.addDocuments([
        {
          id: visitor.id,
          firstName: visitor.firstName,
          lastName: visitor.lastName,
          email: visitor.email,
          phone: visitor.phone,
          company: visitor.company,
          documentNumber: visitor.documentNumber,
          createdAt: visitor.createdAt,
        },
      ]);
    } catch (error) {
      console.error('Error indexing visitor:', error);
    }
  }

  /**
   * Indicizza visita
   */
  async indexVisit(visit: any) {
    try {
      await this.visitsIndex.addDocuments([
        {
          id: visit.id,
          visitorName: `${visit.visitor.firstName} ${visit.visitor.lastName}`,
          hostName: visit.host.name,
          department: visit.department,
          area: visit.area,
          purpose: visit.purpose,
          status: visit.status,
          badgeNumber: visit.badgeNumber,
          scheduledDate: visit.scheduledDate,
          checkInTime: visit.checkInTime,
        },
      ]);
    } catch (error) {
      console.error('Error indexing visit:', error);
    }
  }

  /**
   * Cerca visitatori
   */
  async searchVisitors(query: string, filters?: string) {
    return await this.visitorsIndex.search(query, {
      filter: filters,
      limit: 50,
    });
  }

  /**
   * Cerca visite
   */
  async searchVisits(query: string, filters?: string) {
    return await this.visitsIndex.search(query, {
      filter: filters,
      limit: 50,
    });
  }

  /**
   * Elimina visitatore dall'indice
   */
  async deleteVisitor(visitorId: string) {
    try {
      await this.visitorsIndex.deleteDocument(visitorId);
    } catch (error) {
      console.error('Error deleting visitor from index:', error);
    }
  }

  /**
   * Elimina visita dall'indice
   */
  async deleteVisit(visitId: string) {
    try {
      await this.visitsIndex.deleteDocument(visitId);
    } catch (error) {
      console.error('Error deleting visit from index:', error);
    }
  }
}
