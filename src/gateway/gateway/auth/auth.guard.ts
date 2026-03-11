import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { User } from 'src/DB/models/user.model';
import { TokenService } from 'src/Modules/token/token.service';
import { Socket } from 'socket.io';
import { UserRoleEnum } from 'src/common/enums/user.enums';

export interface SocketWithUser extends Socket {
  user?: User;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: SocketWithUser = context.switchToWs().getClient();
    const authHeader = client.handshake.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Missing authoration header');
    }
    const [bearer, token] = authHeader.split(' ');
    if (!bearer || !token) {
      throw new UnauthorizedException('Invalid authorization header');
    }
    const { user } = await this.tokenService.decodeToken(
      bearer as UserRoleEnum,
      token,
    );

    client.user = user;

    return true;
  }
}
