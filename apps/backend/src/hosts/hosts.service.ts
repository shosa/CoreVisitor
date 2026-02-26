import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHostDto } from './dto/create-host.dto';
import { UpdateHostDto } from './dto/update-host.dto';

@Injectable()
export class HostsService {
  constructor(private prisma: PrismaService) {}

  private readonly includeRelations = {
    department: { select: { id: true, name: true, color: true } },
  };

  findAll() {
    return this.prisma.host.findMany({
      include: this.includeRelations,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  findActive() {
    return this.prisma.host.findMany({
      where: { isActive: true },
      include: this.includeRelations,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async findOne(id: string) {
    const host = await this.prisma.host.findUnique({
      where: { id },
      include: this.includeRelations,
    });
    if (!host) throw new NotFoundException(`Host ${id} non trovato`);
    return host;
  }

  create(dto: CreateHostDto) {
    const { departmentId, ...rest } = dto;
    return this.prisma.host.create({
      data: { ...rest, ...(departmentId ? { department: { connect: { id: departmentId } } } : {}) },
      include: this.includeRelations,
    });
  }

  async update(id: string, dto: UpdateHostDto) {
    await this.findOne(id);
    const { departmentId, ...rest } = dto;
    return this.prisma.host.update({
      where: { id },
      data: {
        ...rest,
        department: departmentId
          ? { connect: { id: departmentId } }
          : departmentId === null
          ? { disconnect: true }
          : undefined,
      },
      include: this.includeRelations,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.host.delete({ where: { id } });
  }
}
