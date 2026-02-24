import { IsString, MaxLength } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @MaxLength(200)
  companyName: string;
}
