import { IsString, IsOptional, IsInt, IsHexColor, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  floor?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  area?: string;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;
}
