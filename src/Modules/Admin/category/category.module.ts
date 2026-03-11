import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TokenModule } from '../../token/token.module';

@Module({
  imports: [TokenModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
