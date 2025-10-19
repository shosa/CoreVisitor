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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VisitStatus } from '@prisma/client';

@Controller('visits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  @Roles('ADMIN', 'RECEPTIONIST', 'EMPLOYEE')
  create(@Body() createVisitDto: CreateVisitDto, @CurrentUser() user: any) {
    return this.visitsService.create(createVisitDto, user.id);
  }

  @Get()
  @Roles('ADMIN', 'RECEPTIONIST', 'EMPLOYEE', 'USER')
  findAll(
    @Query('status') status?: VisitStatus,
    @Query('hostId') hostId?: string,
    @Query('date') date?: string,
    @Query('search') search?: string,
  ) {
    return this.visitsService.findAll(status, hostId, date, search);
  }

  @Get('current')
  @Roles('ADMIN', 'RECEPTIONIST', 'EMPLOYEE', 'USER')
  getCurrentVisits() {
    return this.visitsService.getCurrentVisits();
  }

  @Get('stats')
  @Roles('ADMIN', 'RECEPTIONIST', 'EMPLOYEE', 'USER')
  getStats() {
    return this.visitsService.getStats();
  }

  @Get(':id/badge/pdf')
  @Roles('ADMIN', 'RECEPTIONIST')
  async getBadgePdf(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.visitsService.getBadgePdf(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=badge-${id}.pdf`);
    res.send(pdf);
  }

  @Get(':id/badge')
  @Roles('ADMIN', 'RECEPTIONIST')
  getBadge(@Param('id') id: string) {
    return this.visitsService.getBadge(id);
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPTIONIST', 'EMPLOYEE', 'USER')
  findOne(@Param('id') id: string) {
    return this.visitsService.findOne(id);
  }

  @Post(':id/check-in')
  @Roles('ADMIN', 'RECEPTIONIST')
  checkIn(@Param('id') id: string) {
    return this.visitsService.checkIn(id);
  }

  @Post(':id/check-out')
  @Roles('ADMIN', 'RECEPTIONIST')
  checkOut(@Param('id') id: string) {
    return this.visitsService.checkOut(id);
  }

  @Post(':id/cancel')
  @Roles('ADMIN', 'RECEPTIONIST', 'EMPLOYEE')
  cancel(@Param('id') id: string) {
    return this.visitsService.cancel(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'RECEPTIONIST', 'EMPLOYEE')
  update(@Param('id') id: string, @Body() updateVisitDto: UpdateVisitDto) {
    return this.visitsService.update(id, updateVisitDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.visitsService.remove(id);
  }
}
