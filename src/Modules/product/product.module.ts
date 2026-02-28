import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryModel } from 'src/DB/models/category.model';
import { ProductModel } from 'src/DB/models/product.model';
import { TokenModule } from '../token/token.module';
import { UserModel } from 'src/DB/models/user.model';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [ProductModel, CategoryModel, UserModel, TokenModule],
})
export class ProductModule {}
