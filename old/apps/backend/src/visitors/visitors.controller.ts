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
} from '@nestjs/common';
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
  @Roles('ADMIN', 'RECEPTIONIST')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'document', maxCount: 1 },
      { name: 'photo', maxCount: 1 },
    ]),
  )
  create(
    @Body() createVisitorDto: CreateVisitorDto,
    @UploadedFiles()
    files: {
      document?: Express.Multer.File[];
      photo?: Express.Multer.File[];
    },
  ) {
    return this.visitorsService.create(
      createVisitorDto,
      files?.document?.[0],
      files?.photo?.[0],
    );
  }

  @Get()
  @Roles('ADMIN', 'RECEPTIONIST', 'EMPLOYEE', 'USER')
  findAll(@Query('search') search?: string, @Query('company') company?: string) {
    return this.visitorsService.findAll(search, company);
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPTIONIST', 'EMPLOYEE', 'USER')
  findOne(@Param('id') id: string) {
    return this.visitorsService.findOne(id);
  }

  @Get(':id/document-url')
  @Roles('ADMIN', 'RECEPTIONIST')
  getDocumentUrl(@Param('id') id: string) {
    return this.visitorsService.getDocumentUrl(id);
  }

  @Get(':id/photo-url')
  @Roles('ADMIN', 'RECEPTIONIST', 'EMPLOYEE', 'USER')
  getPhotoUrl(@Param('id') id: string) {
    return this.visitorsService.getPhotoUrl(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'RECEPTIONIST')
  update(@Param('id') id: string, @Body() updateVisitorDto: UpdateVisitorDto) {
    return this.visitorsService.update(id, updateVisitorDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.visitorsService.remove(id);
  }
}
