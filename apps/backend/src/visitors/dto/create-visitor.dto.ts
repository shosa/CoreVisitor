import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
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

  @Transform(({ value }) => {
    if (!value) return undefined;
    // Map Italian frontend values to English backend enum
    const mappings: Record<string, DocumentType> = {
      'CARTA_IDENTITA': DocumentType.id_card,
      'PASSAPORTO': DocumentType.passport,
      'PATENTE': DocumentType.driving_license,
      'ALTRO': DocumentType.other,
    };
    return mappings[value] || value;
  })
  @IsEnum(DocumentType)
  @IsOptional()
  documentType?: DocumentType;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  documentNumber?: string;

  @IsDateString()
  @IsOptional()
  documentExpiry?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  licensePlate?: string;

  @Transform(({ value }) => {
    // Convert string boolean to actual boolean
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  privacyConsent?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
