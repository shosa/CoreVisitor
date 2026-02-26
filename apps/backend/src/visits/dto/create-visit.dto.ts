import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { VisitType } from '@prisma/client';

export class CreateVisitDto {
  @IsUUID()
  visitorId: string;

  @IsUUID()
  departmentId: string;

  @IsEnum(VisitType)
  visitType: VisitType;

  @IsString()
  @IsOptional()
  purpose?: string;

  @IsUUID()
  @IsOptional()
  hostId?: string;

  @IsDateString()
  scheduledDate: string;

  @IsDateString()
  scheduledTimeStart: string;

  @IsDateString()
  @IsOptional()
  scheduledTimeEnd?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
