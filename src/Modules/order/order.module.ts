import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { UserModel } from 'src/DB/models/user.model';
import { Cart, CartModel } from 'src/DB/models/cart.model';
import { OrderModel } from 'src/DB/models/order.model';
import { CouponModel } from 'src/DB/models/coupon.model';
import { TokenModule } from '../token/token.module';
import { PaymentService } from 'src/common/Services/payment/payment.service';

@Module({
  imports: [UserModel , CartModel ,OrderModel , CouponModel , TokenModule  ],
  controllers: [OrderController],
  providers: [OrderService , PaymentService],
})
export class OrderModule {}
