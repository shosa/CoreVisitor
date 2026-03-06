import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { VisitorsService } from './visitors.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('visitors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Post()
  @Roles('admin', 'receptionist')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'document', maxCount: 1 },
    ]),
  )
  create(
    @Body() createVisitorDto: CreateVisitorDto,
    @UploadedFiles()
    files: {
      document?: Express.Multer.File[];
    },
  ) {
    return this.visitorsService.create(
      createVisitorDto,
      files?.document?.[0],
    );
  }

  @Get()
  @Roles('admin', 'receptionist', 'security')
  findAll(@Query('search') search?: string, @Query('company') company?: string) {
    return this.visitorsService.findAll(search, company);
  }

  @Get(':id')
  @Roles('admin', 'receptionist', 'security')
  findOne(@Param('id') id: string) {
    return this.visitorsService.findOne(id);
  }

  @Get(':id/document-url')
  @Roles('admin', 'receptionist')
  getDocumentUrl(@Param('id') id: string) {
    return this.visitorsService.getDocumentUrl(id);
  }

  @Get(':id/signature-url')
  @Roles('admin', 'receptionist', 'security')
  getSignatureUrl(@Param('id') id: string) {
    return this.visitorsService.getSignatureUrl(id);
  }

  @Get(':id/signature-file')
  @Roles('admin', 'receptionist', 'security')
  async getSignatureFile(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.visitorsService.getSignatureBuffer(id);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.send(buffer);
  }

  @Get(':id/document-file')
  @Roles('admin', 'receptionist', 'security')
  async getDocumentFile(@Param('id') id: string, @Res() res: Response) {
    const { buffer, mimeType } = await this.visitorsService.getDocumentBuffer(id);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.send(buffer);
  }

  @Patch(':id')
  @Roles('admin', 'receptionist')
  update(@Param('id') id: string, @Body() updateVisitorDto: UpdateVisitorDto) {
    return this.visitorsService.update(id, updateVisitorDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.visitorsService.remove(id);
  }
}
