import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateVisitorDto {
  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  company?: string;

  @IsEnum(DocumentType)
  @IsOptional()
  documentType?: DocumentType;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  documentNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  licensePlate?: string;

  @IsBoolean()
  @IsOptional()
  privacyConsent?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
