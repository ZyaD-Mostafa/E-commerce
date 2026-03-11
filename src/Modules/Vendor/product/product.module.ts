import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TokenModule } from '../../token/token.module';


@Module({
  imports: [
    TokenModule,
  ],
  controllers: [ProductController],
  providers: [ProductService ],
})
export class ProductModule {}