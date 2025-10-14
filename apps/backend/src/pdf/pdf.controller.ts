import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { CreatePdfDto } from './dto/create-pdf.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('pdf')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('generate')
  @Roles('ADMIN', 'RECEPTIONIST')
  async generatePdf(@Body() createPdfDto: CreatePdfDto, @Res() res: Response) {
    const pdf = await this.pdfService.generatePdf(createPdfDto.html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=generated.pdf');
    res.send(pdf);
  }
}
