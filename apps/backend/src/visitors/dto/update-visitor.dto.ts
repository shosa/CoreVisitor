import { PartialType } from '@nestjs/mapped-types';
import { CreateVisitorDto } from './create-visitor.dto';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class UpdateVisitorDto extends PartialType(CreateVisitorDto) {
  // Override documentType to ensure Transform is applied in updates
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
}
