import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OtpEnum, ProviderEnum } from 'src/common/enums/user.enums';
import { generateOTP } from 'src/common/utils/otp.util';
import { HOtpDocument, Otp } from 'src/DB/models/otp.model';
import { HUserDocument, User } from 'src/DB/models/user.model';
import { ConfrimEmailDto, LoginDto, ResendOtpDto } from './dto/createUser.dto';
import { compareHash } from 'src/common/utils/hashing/hash';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { AppService } from 'src/app.service';
import { TokenService } from 'src/Modules/token/token.service';
import { UserRepository } from 'src/DB/Repositories/user.repo';
import { OtpRepository } from 'src/DB/Repositories/otp.repo';
import { filter } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _otpRepository: OtpRepository,
    private readonly _tokenService: TokenService,
  ) {}

  // function create otp
  async createOtp(userId: Types.ObjectId, type = OtpEnum.EMAIL_VERIFICATION) {
    await this._otpRepository.create([
      {
        createdBy: userId,
        code: generateOTP(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 2),
        type,
      },
    ]);
  }

  async signup(body: any) {
    const { firstname, lastname, email, password } = body;

    const chekUser = await this._userRepository.findOne({ filter: { email } });
    if (chekUser) {
      throw new ConflictException('User already exists');
    }

    const user = await this._userRepository.create({
      firstname,
      lastname,
      email,
      password,
    });

    await this.createOtp(user._id);
    return {
      message: 'User created successfully',
      user,
    };
  }

  async resendOtp(resendOtp: ResendOtpDto) {
    const { email } = resendOtp;
    const user = await this._userRepository.findOne({
      filter: { email },
      options: {
        populate: [{ path: 'otp', match: { type: OtpEnum.EMAIL_VERIFICATION } }],
      },
    });
    if (!user) {
      throw new ConflictException('User not found');
    }
    if (user.otp?.length > 0) {
      throw new ConflictException('OTP already sent');
    }
    await this.createOtp(user._id);
    return {
      message: 'OTP resent successfully',
    };
  }

  async confrimEmail(confrimEmail: ConfrimEmailDto) {
    const { email, code } = confrimEmail;
    const user = await this._userRepository.findOne({
      filter: { email, confirmEmail: { $exists: false } },
      options: {
        populate: [{ path: 'otp', match: { type: OtpEnum.EMAIL_VERIFICATION } }],
      },
    });
    if (!user) {
      throw new ConflictException('User not found');
    }
    if (!user.otp?.length) {
      throw new ConflictException('OTP not found');
    }
    if (!(await compareHash(code, user.otp[0].code))) {
      throw new ConflictException('Invalid OTP');
    }

    await this._userRepository.updateOne({
      filter: { _id: user._id },
      update: { $set: { confirmEmail: new Date() }, $inc: { __v: 1 } },
      options: { runValidators: true },
    });

    return {
      message: 'user confrimed successfully',
    };
  }

  async login(loginData: LoginDto) {
    const { email, password } = loginData;
    const user = await this._userRepository.findOne({
      filter: {
        email,
        confirmEmail: { $exists: true },
        provider: ProviderEnum.SYSTEM,
      },
    });
    if (!user) {
      throw new ConflictException('User not found');
    }

    if (!(await compareHash(password, user.password))) {
      throw new ConflictException('Invalid password');
    }

    // genrateToken
    const token = await this._tokenService.createToken({
      payload: { id: user._id, email: user.email },
      role: user.role,
    });

    return {
      message: 'User logged in successfully',
      token,
    };
  }
}
