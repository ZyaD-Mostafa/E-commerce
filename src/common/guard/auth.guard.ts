import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/DB/models/user.model';
import { TokenService } from 'src/Modules/token/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly tokenService: TokenService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // auth
    const authHeaders = request.headers.authorization;
    const [bearer, token] = authHeaders.split(' ');
    const { decoded } = await this.tokenService.decodeToken(bearer, token);

    const user = await this.userModel.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    request.user = user;
    request.decoded = decoded;

    return true;
  }
}
