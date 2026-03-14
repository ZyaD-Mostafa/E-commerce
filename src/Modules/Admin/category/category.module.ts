import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TokenModule } from '../../token/token.module';
import { RedisModule } from 'src/common/provider/redis.module';

@Module({
  imports: [TokenModule ,RedisModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
