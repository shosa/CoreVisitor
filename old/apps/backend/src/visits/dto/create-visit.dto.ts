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
  purpose: string;

  @IsDateString()
  scheduledDate: string;

  @IsDateString()
  scheduledTimeStart: string;

  @IsDateString()
  scheduledTimeEnd: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
