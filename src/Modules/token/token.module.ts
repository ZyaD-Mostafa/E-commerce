import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { TokenModel } from 'src/DB/models/token.model';
import { UserModel } from 'src/DB/models/user.model';

@Module({
  imports: [JwtModule, TokenModel, UserModel],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
