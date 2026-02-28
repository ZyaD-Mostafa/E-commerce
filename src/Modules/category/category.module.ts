import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryModel } from 'src/DB/models/category.model';
import { UserModel } from 'src/DB/models/user.model';
import { TokenModule } from '../token/token.module';
import { BrandModel } from 'src/DB/models/brand.model';

@Module({
  imports: [CategoryModel, UserModel, TokenModule, BrandModel],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
