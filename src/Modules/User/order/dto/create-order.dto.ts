import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsMongoId()
  cartId: string;

  @IsString()
  @IsNotEmpty()
  address: string;


  @IsString()
  @IsNotEmpty()
  phone: string;
}
