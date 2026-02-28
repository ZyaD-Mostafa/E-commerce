import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { TokenModule } from '../token/token.module';
import { CouponModel } from 'src/DB/models/coupon.model';
import { UserModel } from 'src/DB/models/user.model';
import { ProductModel } from 'src/DB/models/product.model';

@Module({
  imports:[TokenModule , CouponModel , UserModel , ProductModel],
  controllers: [CouponController ],
  providers: [CouponService],
})
export class CouponModule {}
