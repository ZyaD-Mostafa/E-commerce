import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TokenModule } from 'src/Modules/token/token.module';
import { RedisModule } from 'src/common/provider/redis.module';

@Module({
  imports: [TokenModule, RedisModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
