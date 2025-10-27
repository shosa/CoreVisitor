import { PartialType } from '@nestjs/mapped-types';
import { CreateVisitDto } from './create-visit.dto';
import { IsOptional, IsString, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { VisitType, VisitStatus } from '@prisma/client';

export class UpdateVisitDto extends PartialType(CreateVisitDto) {
  @IsOptional()
  @IsUUID()
  visitorId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsEnum(VisitType)
  visitType?: VisitType;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsDateString()
  scheduledTimeStart?: string;

  @IsOptional()
  @IsDateString()
  scheduledTimeEnd?: string;

  @IsOptional()
  @IsEnum(VisitStatus)
  status?: VisitStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
