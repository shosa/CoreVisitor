import { IsString, IsOptional, IsBoolean, IsEnum, IsUUID } from 'class-validator';
import { VisitType } from '@prisma/client';

export class SelfRegisterDto {
  @IsUUID()
  @IsOptional()
  visitorId?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsEnum(VisitType)
  visitType: VisitType;

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsUUID()
  @IsOptional()
  hostId?: string;

  @IsString()
  @IsOptional()
  hostName?: string;

  @IsString()
  @IsOptional()
  purpose?: string;

  @IsBoolean()
  privacyConsent: boolean;
}
