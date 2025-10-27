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
} from '@nestjs/common';
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
  @Roles('admin', 'receptionist')
  create(@Body() createVisitDto: CreateVisitDto, @CurrentUser() user: any) {
    return this.visitsService.create(createVisitDto, user.id);
  }

  @Get()
  @Roles('admin', 'receptionist', 'security')
  findAll(
    @Query('status') status?: VisitStatus,
    @Query('hostId') hostId?: string,
    @Query('date') date?: string,
    @Query('search') search?: string,
  ) {
    return this.visitsService.findAll(status, hostId, date, search);
  }

  @Get('current')
  @Roles('admin', 'receptionist', 'security')
  getCurrentVisits() {
    return this.visitsService.getCurrentVisits();
  }

  @Get('stats')
  @Roles('admin', 'receptionist', 'security')
  getStats() {
    return this.visitsService.getStats();
  }

  @Get(':id/badge')
  @Roles('admin', 'receptionist')
  getBadge(@Param('id') id: string) {
    return this.visitsService.getBadge(id);
  }

  @Get(':id')
  @Roles('admin', 'receptionist', 'security')
  findOne(@Param('id') id: string) {
    return this.visitsService.findOne(id);
  }

  @Post(':id/check-in')
  @Roles('admin', 'receptionist')
  checkIn(@Param('id') id: string) {
    return this.visitsService.checkIn(id);
  }

  @Post(':id/check-out')
  @Roles('admin', 'receptionist')
  checkOut(@Param('id') id: string) {
    return this.visitsService.checkOut(id);
  }

  @Post(':id/cancel')
  @Roles('admin', 'receptionist')
  cancel(@Param('id') id: string) {
    return this.visitsService.cancel(id);
  }

  @Patch(':id')
  @Roles('admin', 'receptionist')
  update(@Param('id') id: string, @Body() updateVisitDto: UpdateVisitDto) {
    return this.visitsService.update(id, updateVisitDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.visitsService.remove(id);
  }
}
