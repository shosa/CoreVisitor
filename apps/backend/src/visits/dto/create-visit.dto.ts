import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { VisitPurpose } from '@prisma/client';

export class CreateVisitDto {
  @IsUUID()
  visitorId: string;

  @IsUUID()
  hostId: string;

  @IsEnum(VisitPurpose)
  purpose: VisitPurpose;

  @IsString()
  @IsOptional()
  purposeNotes?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  area?: string;

  @IsDateString()
  scheduledDate: string;

  @IsDateString()
  @IsOptional()
  scheduledEndDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
