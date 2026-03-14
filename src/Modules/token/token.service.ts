import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';

import { UserRoleEnum } from 'src/common/enums/user.enums';
import { getSignatureLevel } from 'src/common/token/token';

import { TokenRepository } from 'src/DB/Repositories/token.repo';
import { UserRepository } from 'src/DB/Repositories/user.repo';
import { v4 as uuid } from 'uuid';
@Injectable()
export class TokenService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _tokenRepository: TokenRepository,
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
      } else if (bearer === 'VENDOR') {
        role = UserRoleEnum.VENDOR;
      } else {
        throw new UnauthorizedException('Invalid role in authorization header');
      }
      const secret = getSignatureLevel(role);

      const decoded = await this._JwtService.verifyAsync(token, { secret });
      if (!decoded?.id || !decoded.iat)
        throw new UnauthorizedException('Invalid Token Payload');

      if (
        await this._tokenRepository.findOne({ filter: { jti: decoded.jti } })
      ) {
        throw new UnauthorizedException('Token is revoked');
      }

      const user = await this._userRepository.findById({ id: decoded.id });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (!user.confirmEmail && user.role == UserRoleEnum.USER) {
        throw new UnauthorizedException('User not confirmed');
      }
      if ((user.changeCredintaialstime?.getTime() || 0) > decoded.iat * 1000) {
        throw new UnauthorizedException('logedOut from All devices');
      }
      return { user , decoded };
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
    const revokedToken = await this._tokenRepository.create({
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
