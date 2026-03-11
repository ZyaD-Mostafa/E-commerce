// common/DB/Repositories/repositories.module.ts
import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, brandSchema } from '../models/brand.model';
import { Category, categorySchema } from '../models/category.model';
import { Product, productSchema } from '../models/product.model';
// ... import all other models

import { BrandRepository } from './brand.repo';
import { CategoryRepository } from './category.repo';
import { ProductRepository } from './product.repo';
import { Cart, cartSchema } from '../models/cart.model';
import { Coupon, couponSchema } from '../models/coupon.model';
import { Order, orderSchema } from '../models/order.model';
import { User, userSchema } from '../models/user.model';
import { Otp, otpSchema } from '../models/otp.model';
import { Token, tokenSchema } from '../models/token.model';
import { CartRepository } from './cart.repo';
import { CouponRepository } from './coupon.repo';
import { OrderRepository } from './order.repo';
import { UserRepository } from './user.repo';
import { TokenRepository } from './token.repo';
import { OtpRepository } from './otp.repo';
// ... import all other repositories
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Brand.name, schema: brandSchema },
      { name: Category.name, schema: categorySchema },
      { name: Product.name, schema: productSchema },
      { name: Cart.name, schema: cartSchema },
      { name: Coupon.name, schema: couponSchema },
      { name: Order.name, schema: orderSchema },
      { name: User.name, schema: userSchema },
      { name: Otp.name, schema: otpSchema },
      { name: Token.name, schema: tokenSchema },
      // ... add all models
    ]),
  ],
  providers: [
    BrandRepository,
    CategoryRepository,
    ProductRepository,
    CartRepository,
    CouponRepository,
    OrderRepository,
    UserRepository,
    OtpRepository,
    TokenRepository,
    // ... add all repositories
  ],
  exports: [
    BrandRepository,
    CategoryRepository,
    ProductRepository,
    CartRepository,
    CouponRepository,
    OrderRepository,
    UserRepository,
    OtpRepository,
    TokenRepository,
    // ... export all repositories
  ],
})
export class RepositoriesModule {}
