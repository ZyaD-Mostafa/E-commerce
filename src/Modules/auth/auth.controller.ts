import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  type ConfrimEmailDto,
  confrimEmailSchema,
  type CreateUserDto,
  creteUserSchema,
  type LoginDto,
  loginSchema,
  type ResendOtpDto,
  resendOtpSchema,
} from './dto/createUser.dto';
import { LoggingInterceptor } from 'src/common/interceptor/logger.interceptor';

import { ZodPipe } from 'src/common/pipes/zod.pipe';

// http://localhost:3000/auth/profile
@UseInterceptors(LoggingInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @UsePipes(new ZodPipe(creteUserSchema))
  signup(@Body() body: CreateUserDto) {
    return this.authService.signup(body);
  }

  @Post('/resend-otp')
  @UsePipes(new ZodPipe(resendOtpSchema))
  resendOtp(@Body() resendOtp: ResendOtpDto) {
    return this.authService.resendOtp(resendOtp);
  }

  @Patch('/confrim-email')
  @UsePipes(new ZodPipe(confrimEmailSchema))
  confrimEmail(@Body() confrimEmail: ConfrimEmailDto) {
    return this.authService.confrimEmail(confrimEmail);
  }

  @Post('/login')
  //@HttpCode(200)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodPipe(loginSchema))
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }



  
}
