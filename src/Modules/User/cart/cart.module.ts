import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';

import { TokenModule } from 'src/Modules/token/token.module';


@Module({
  imports: [
    TokenModule,
  ],
  controllers: [CartController],
  providers: [
    CartService,
  ],
})
export class CartModule {}
