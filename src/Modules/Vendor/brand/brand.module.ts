import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { TokenModule } from 'src/Modules/token/token.module';
import { RedisModule } from 'src/common/provider/redis.module';

@Module({
  imports: [TokenModule, RedisModule],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule {}
