import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TokenModule } from 'src/Modules/token/token.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports :[TokenModule]
})
export class AdminModule {}
