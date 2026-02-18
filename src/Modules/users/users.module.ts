import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TokenModule } from '../token/token.module';
import { UserModel } from 'src/DB/models/user.model';

@Module({
    imports: [UserModel,  TokenModule],

  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
