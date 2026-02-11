import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VisitStatus } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  /**
   * Genera PDF registro visite giornaliero
   * Formato tabulato professionale, solo testo
   */
  async generateVisitsReport(
    dateFrom?: string,
    dateTo?: string,
    status?: VisitStatus,
  ): Promise<Buffer> {
    const where: any = {};

    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.scheduledDate.lte = end;
      }
    }

    if (status) {
      where.status = status;
    }

    const visits = await this.prisma.visit.findMany({
      where,
      include: {
        visitor: true,
        department: true,
        hostUser: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { scheduledTimeStart: 'asc' },
      ],
    });

    return this.buildVisitsPdf(visits, dateFrom, dateTo);
  }

  /**
   * Genera PDF elenco visitatori
   */
  async generateVisitorsReport(): Promise<Buffer> {
    const visitors = await this.prisma.visitor.findMany({
      orderBy: { lastName: 'asc' },
      include: {
        _count: { select: { visits: true } },
      },
    });

    return this.buildVisitorsPdf(visitors);
  }

  // ─── PDF Registro Visite ────────────────────────────────

  private buildVisitsPdf(visits: any[], dateFrom?: string, dateTo?: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Intestazione
      const now = format(new Date(), "dd/MM/yyyy 'alle' HH:mm", { locale: it });
      let period = '';
      if (dateFrom && dateTo) {
        period = `dal ${format(new Date(dateFrom), 'dd/MM/yyyy')} al ${format(new Date(dateTo), 'dd/MM/yyyy')}`;
      } else if (dateFrom) {
        period = `dal ${format(new Date(dateFrom), 'dd/MM/yyyy')}`;
      } else if (dateTo) {
        period = `fino al ${format(new Date(dateTo), 'dd/MM/yyyy')}`;
      } else {
        period = 'Tutte le visite';
      }

      doc.font('Helvetica-Bold').fontSize(14)
        .text('REGISTRO VISITE', { align: 'center' });
      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(9)
        .text(period, { align: 'center' });
      doc.fontSize(8)
        .text(`Generato il ${now} — Totale: ${visits.length} visite`, { align: 'center' });
      doc.moveDown(0.8);

      if (visits.length === 0) {
        doc.font('Helvetica').fontSize(10)
          .text('Nessuna visita trovata per il periodo selezionato.', { align: 'center' });
        doc.end();
        return;
      }

      // Colonne tabella
      const cols = [
        { header: 'Data',        width: 65,  key: 'date' },
        { header: 'Orario',      width: 55,  key: 'time' },
        { header: 'Visitatore',  width: 120, key: 'visitor' },
        { header: 'Azienda',     width: 100, key: 'company' },
        { header: 'Reparto',     width: 80,  key: 'department' },
        { header: 'Referente',   width: 90,  key: 'host' },
        { header: 'Motivo',      width: 90,  key: 'purpose' },
        { header: 'Stato',       width: 65,  key: 'status' },
        { header: 'Check-in',    width: 50,  key: 'checkin' },
        { header: 'Check-out',   width: 50,  key: 'checkout' },
      ];

      const tableLeft = doc.page.margins.left;
      const rowHeight = 16;
      const headerHeight = 20;
      const fontSize = 7;
      const headerFontSize = 7.5;

      let y = doc.y;

      // Funzione per disegnare header tabella
      const drawHeader = () => {
        // Linea sopra header
        doc.moveTo(tableLeft, y).lineTo(tableLeft + cols.reduce((s, c) => s + c.width, 0), y)
          .lineWidth(0.8).stroke('#000000');
        y += 2;

        let x = tableLeft;
        doc.font('Helvetica-Bold').fontSize(headerFontSize);
        for (const col of cols) {
          doc.text(col.header, x + 2, y + 3, { width: col.width - 4, align: 'left' });
          x += col.width;
        }
        y += headerHeight;

        // Linea sotto header
        doc.moveTo(tableLeft, y).lineTo(tableLeft + cols.reduce((s, c) => s + c.width, 0), y)
          .lineWidth(0.5).stroke('#000000');
        y += 2;
      };

      drawHeader();

      // Righe dati
      doc.font('Helvetica').fontSize(fontSize);
      const statusMap: Record<string, string> = {
        pending: 'In attesa',
        approved: 'Approvata',
        checked_in: 'Presente',
        checked_out: 'Uscito',
        cancelled: 'Annullata',
      };

      for (let i = 0; i < visits.length; i++) {
        const visit = visits[i];

        // Nuova pagina se necessario
        if (y + rowHeight > doc.page.height - doc.page.margins.bottom - 20) {
          doc.addPage();
          y = doc.page.margins.top;
          drawHeader();
        }

        // Riga alternata
        if (i % 2 === 0) {
          doc.rect(tableLeft, y, cols.reduce((s, c) => s + c.width, 0), rowHeight)
            .fill('#f5f5f5');
          doc.fillColor('#000000');
        }

        const row: Record<string, string> = {
          date: format(new Date(visit.scheduledDate), 'dd/MM/yyyy'),
          time: format(new Date(visit.scheduledTimeStart), 'HH:mm'),
          visitor: `${visit.visitor.lastName} ${visit.visitor.firstName}`,
          company: visit.visitor.company || '-',
          department: visit.department?.name || '-',
          host: visit.hostUser
            ? `${visit.hostUser.lastName} ${visit.hostUser.firstName}`
            : (visit.hostName || '-'),
          purpose: visit.purpose || '-',
          status: statusMap[visit.status] || visit.status,
          checkin: visit.actualCheckIn
            ? format(new Date(visit.actualCheckIn), 'HH:mm')
            : '-',
          checkout: visit.actualCheckOut
            ? format(new Date(visit.actualCheckOut), 'HH:mm')
            : '-',
        };

        let x = tableLeft;
        for (const col of cols) {
          const text = row[col.key] || '-';
          doc.text(text, x + 2, y + 4, {
            width: col.width - 4,
            height: rowHeight - 2,
            ellipsis: true,
          });
          x += col.width;
        }

        y += rowHeight;
      }

      // Linea finale
      doc.moveTo(tableLeft, y).lineTo(tableLeft + cols.reduce((s, c) => s + c.width, 0), y)
        .lineWidth(0.5).stroke('#000000');

      // Footer
      y += 15;
      doc.font('Helvetica').fontSize(7).fillColor('#666666');
      doc.text(
        'Documento generato automaticamente — CoreVisitor — Registro accessi visitatori',
        tableLeft, y, { align: 'center', width: cols.reduce((s, c) => s + c.width, 0) },
      );

      doc.end();
    });
  }

  // ─── PDF Elenco Visitatori ──────────────────────────────

  private buildVisitorsPdf(visitors: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'portrait',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const now = format(new Date(), "dd/MM/yyyy 'alle' HH:mm", { locale: it });

      doc.font('Helvetica-Bold').fontSize(14)
        .text('ELENCO VISITATORI', { align: 'center' });
      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(9)
        .text(`Generato il ${now} — Totale: ${visitors.length} visitatori`, { align: 'center' });
      doc.moveDown(0.8);

      if (visitors.length === 0) {
        doc.font('Helvetica').fontSize(10)
          .text('Nessun visitatore registrato.', { align: 'center' });
        doc.end();
        return;
      }

      const cols = [
        { header: '#',          width: 25,  key: 'num' },
        { header: 'Cognome',    width: 90,  key: 'lastName' },
        { header: 'Nome',       width: 80,  key: 'firstName' },
        { header: 'Azienda',    width: 100, key: 'company' },
        { header: 'Email',      width: 120, key: 'email' },
        { header: 'Telefono',   width: 70,  key: 'phone' },
        { header: 'Visite',     width: 40,  key: 'visits' },
      ];

      const tableLeft = doc.page.margins.left;
      const rowHeight = 16;
      const headerHeight = 20;
      const fontSize = 7.5;
      const headerFontSize = 8;

      let y = doc.y;

      const drawHeader = () => {
        doc.moveTo(tableLeft, y).lineTo(tableLeft + cols.reduce((s, c) => s + c.width, 0), y)
          .lineWidth(0.8).stroke('#000000');
        y += 2;

        let x = tableLeft;
        doc.font('Helvetica-Bold').fontSize(headerFontSize);
        for (const col of cols) {
          doc.text(col.header, x + 2, y + 3, { width: col.width - 4, align: 'left' });
          x += col.width;
        }
        y += headerHeight;

        doc.moveTo(tableLeft, y).lineTo(tableLeft + cols.reduce((s, c) => s + c.width, 0), y)
          .lineWidth(0.5).stroke('#000000');
        y += 2;
      };

      drawHeader();

      doc.font('Helvetica').fontSize(fontSize);

      for (let i = 0; i < visitors.length; i++) {
        const v = visitors[i];

        if (y + rowHeight > doc.page.height - doc.page.margins.bottom - 20) {
          doc.addPage();
          y = doc.page.margins.top;
          drawHeader();
        }

        if (i % 2 === 0) {
          doc.rect(tableLeft, y, cols.reduce((s, c) => s + c.width, 0), rowHeight)
            .fill('#f5f5f5');
          doc.fillColor('#000000');
        }

        const row: Record<string, string> = {
          num: (i + 1).toString(),
          lastName: v.lastName,
          firstName: v.firstName,
          company: v.company || '-',
          email: v.email || '-',
          phone: v.phone || '-',
          visits: v._count?.visits?.toString() || '0',
        };

        let x = tableLeft;
        for (const col of cols) {
          doc.text(row[col.key] || '-', x + 2, y + 4, {
            width: col.width - 4,
            height: rowHeight - 2,
            ellipsis: true,
          });
          x += col.width;
        }

        y += rowHeight;
      }

      doc.moveTo(tableLeft, y).lineTo(tableLeft + cols.reduce((s, c) => s + c.width, 0), y)
        .lineWidth(0.5).stroke('#000000');

      y += 15;
      doc.font('Helvetica').fontSize(7).fillColor('#666666');
      doc.text(
        'Documento generato automaticamente — CoreVisitor — Elenco visitatori registrati',
        tableLeft, y, { align: 'center', width: cols.reduce((s, c) => s + c.width, 0) },
      );

      doc.end();
    });
  }
}
