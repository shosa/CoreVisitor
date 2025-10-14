import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePdfDto {
  @IsString()
  @IsNotEmpty()
  html: string;
}
