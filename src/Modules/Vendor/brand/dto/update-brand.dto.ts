import { IsString, Length } from 'class-validator';
export class UpdateBrandDto {
  @IsString()
  @Length(2, 20)
  name: string;
}
