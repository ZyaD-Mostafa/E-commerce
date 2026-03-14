import { IsString, Length } from 'class-validator';
export class UpdateBrandDto {
  @IsString()
  @Length(2, 20)
  name: string;
  @IsString()
  @Length(2, 50000)
  description: string;
}
