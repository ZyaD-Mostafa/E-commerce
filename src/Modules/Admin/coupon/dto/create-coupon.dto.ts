import { IsNotEmpty, IsString, IsUppercase, Max, Min } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  @IsUppercase()
  code: string;
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  discountPersentage: number;
  @IsNotEmpty()
  expireAt: Date;

}
