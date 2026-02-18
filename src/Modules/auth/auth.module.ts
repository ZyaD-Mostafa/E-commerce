import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModel } from 'src/DB/models/user.model';
import { OtpModel } from 'src/DB/models/otp.model';
import { TokenModule } from 'src/Modules/token/token.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [UserModel, OtpModel, TokenModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {
  constructor() {}
}
