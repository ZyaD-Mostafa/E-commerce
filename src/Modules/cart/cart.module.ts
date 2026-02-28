import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { UserModel } from 'src/DB/models/user.model';
import { CartModel } from 'src/DB/models/cart.model';
import { TokenModule } from 'src/Modules/token/token.module';
import { ProductModel } from 'src/DB/models/product.model';
import { CouponModel } from 'src/DB/models/coupon.model';

@Module({
  imports: [CartModel, UserModel, TokenModule, ProductModel ,CouponModel],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
