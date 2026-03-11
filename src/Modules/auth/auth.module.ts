import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenModule } from 'src/Modules/token/token.module';

@Module({
  imports: [
    TokenModule,
    JwtModule.register({}), // configure your secret, expiresIn etc.
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService], // لو هتستخدم AuthService بره
})
export class AuthModule {}
