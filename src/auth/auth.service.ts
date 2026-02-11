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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly _userModel: Model<HUserDocument>,
    @InjectModel(Otp.name) private readonly _otpModel: Model<HOtpDocument>,
    private readonly _JwtService: JwtService,
  ) {}

  // function create otp
  async createOtp(userId: Types.ObjectId, type = OtpEnum.EMAIL_VERIFICATION) {
    await this._otpModel.create([
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

    const chekUser = await this._userModel.findOne({ email });
    if (chekUser) {
      throw new ConflictException('User already exists');
    }

    const user = await this._userModel.create({
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
    const user = await this._userModel
      .findOne({ email })
      .populate([{ path: 'otp', match: { type: OtpEnum.EMAIL_VERIFICATION } }]);
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
    const user = await this._userModel
      .findOne({ email, confirmEmail: { $exists: false } })
      .populate([{ path: 'otp', match: { type: OtpEnum.EMAIL_VERIFICATION } }]);
    if (!user) {
      throw new ConflictException('User not found');
    }
    if (!user.otp?.length) {
      throw new ConflictException('OTP not found');
    }
    if (!(await compareHash(code, user.otp[0].code))) {
      throw new ConflictException('Invalid OTP');
    }

    await this._userModel.updateOne(
      { _id: user._id },
      { $set: { confirmEmail: new Date() }, $inc: { __v: 1 } },
    );

    return {
      message: 'user confrimed successfully',
    };
  }

  async login(loginData: LoginDto) {
    const { email, password } = loginData;
    const user = await this._userModel.findOne({
      email,
      confirmEmail: { $exists: true },
      provider: ProviderEnum.SYSTEM,
    });
    if (!user) {
      throw new ConflictException('User not found');
    }

    if (!(await compareHash(password, user.password))) {
      throw new ConflictException('Invalid password');
    }

    // genrateToken
    const jwtid = randomUUID();
    const accessToken = this._JwtService.sign(
      { id: user._id, email: user.email },
      {
        expiresIn: Number(process.env.JWT_EXPIRES_IN),
        jwtid,
        secret: process.env.JWT_SECRET,
      },
    );
    return {
      message: 'User logged in successfully',
      accessToken,
    };
  }

  async getProfile(req: any) {
    return{
      message: 'User profile',
      user: req.user,
    };
  }
}
