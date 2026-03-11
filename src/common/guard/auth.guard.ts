import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/DB/models/user.model';
import { UserRepository } from 'src/DB/Repositories/user.repo';
import { TokenService } from 'src/Modules/token/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly _userRepo: UserRepository,
    private readonly tokenService: TokenService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // auth
    const authHeaders = request.headers.authorization;
    const [bearer, token] = authHeaders.split(' ');
    const { user, decoded } = await this.tokenService.decodeToken(bearer, token);
    request.user = user;
    request.decoded = decoded;

    return true;
  }
}
