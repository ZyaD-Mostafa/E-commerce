import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { Token, TokenModel, tokenSchema } from 'src/DB/models/token.model';
import { User, UserModel, userSchema } from 'src/DB/models/user.model';
import { UserRepository } from 'src/DB/Repositories/user.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenRepository } from 'src/DB/Repositories/token.repo';

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([
      { name: Token.name, schema: tokenSchema },
      { name: User.name, schema: userSchema },
    ]),
  ],
  providers: [TokenService, UserRepository ,TokenRepository],
  exports: [TokenService],
})
export class TokenModule {}
