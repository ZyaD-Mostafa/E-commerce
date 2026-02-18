import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryModel } from 'src/DB/models/category.model';

@Module({
  imports: [CategoryModel],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
