import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TokenModule } from '../../token/token.module';
import { PaymentService } from 'src/common/Services/payment/payment.service';

@Module({
  imports: [
    TokenModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    PaymentService
  ],
})
export class OrderModule {}