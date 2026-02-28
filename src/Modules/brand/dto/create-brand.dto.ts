import { IsString, Length } from 'class-validator';
export class CreateBrandDto {
  @IsString()
  @Length(2, 20)
  name: string;
}

//class validator 
