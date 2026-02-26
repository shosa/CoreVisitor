import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { HostsService } from './hosts.service';
import { CreateHostDto } from './dto/create-host.dto';
import { UpdateHostDto } from './dto/update-host.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('hosts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HostsController {
  constructor(private readonly hostsService: HostsService) {}

  @Get()
  @Roles('admin', 'receptionist', 'security')
  findAll() {
    return this.hostsService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'receptionist', 'security')
  findOne(@Param('id') id: string) {
    return this.hostsService.findOne(id);
  }

  @Post()
  @Roles('admin', 'receptionist')
  create(@Body() dto: CreateHostDto) {
    return this.hostsService.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'receptionist')
  update(@Param('id') id: string, @Body() dto: UpdateHostDto) {
    return this.hostsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.hostsService.remove(id);
  }
}
