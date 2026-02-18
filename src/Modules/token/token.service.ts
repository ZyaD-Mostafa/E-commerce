import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRoleEnum } from 'src/common/enums/user.enums';
import { getSignatureLevel } from 'src/common/token/token';
import { Token } from 'src/DB/models/token.model';
import { User } from 'src/DB/models/user.model';
import { v4 as uuid } from 'uuid';
import be from 'zod/v4/locales/be.js';
@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name) private readonly _tokenModel: Model<Token>,
    @InjectModel(User.name) private readonly _userModel: Model<User>,
    private readonly _JwtService: JwtService,
  ) {}
  async createToken({
    payload,
    role,
  }: {
    payload: object;
    role: UserRoleEnum;
  }) {
    const jwtid = uuid();
    const token = this._JwtService.sign(payload, {
      expiresIn: Number(process.env.JWT_EXPIRES_IN),
      jwtid,
      secret: getSignatureLevel(role),
    });
    return token;
  }

  async decodeToken(bearer: UserRoleEnum, token: string) {
    try {
      let role: UserRoleEnum;
      if (bearer === 'ADMIN') {
        role = UserRoleEnum.ADMIN;
      } else if (bearer === 'USER') {
        role = UserRoleEnum.USER;
      } else {
        throw new UnauthorizedException('Invalid role in authorization header');
      }
      const secret = getSignatureLevel(role);

      const decoded = await this._JwtService.verifyAsync(token, { secret });
      if (!decoded?.id || !decoded.iat)
        throw new UnauthorizedException('Invalid Token Payload');

      if (await this._tokenModel.findOne({ jti: decoded.jti })) {
        throw new UnauthorizedException('token is revoked ');
      }

      const user = await this._userModel.findById(decoded.id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if ((user.changeCredintaialstime?.getTime() || 0) > decoded.iat * 1000) {
        throw new UnauthorizedException('logedOut from All devices');
      }
      return { user, decoded };
    } catch (error) {
      // ✅ التوكين انتهى
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      }

      // ❌ توكين بايظ / سيجنتشر غلط
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }

      throw error;
    }
  }

  async createRevokedToken(decoded: any) {
    const revokedToken = await this._tokenModel.create({
      jti: decoded.jti,
      expiresIn: decoded.exp,
      userId: decoded.id,
    });

    if (!revokedToken) {
      throw new BadRequestException('Failed to create revoked token');
    }
    return revokedToken;
  }
}
