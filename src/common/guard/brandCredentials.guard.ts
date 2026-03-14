import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BrandRepository } from 'src/DB/Repositories/brand.repo';
import { UserRepository } from 'src/DB/Repositories/user.repo';
import { UserRoleEnum } from '../enums/user.enums';
import {
  SKIP_GUARD,
  SkipGuard,
} from '../decorator/skipBrandCredentail.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class brandCredentials implements CanActivate {
  constructor(
    private readonly _brandRepo: BrandRepository,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_GUARD, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) {
      return true;
    }
    const user = request.user;
    if (user?.role !== UserRoleEnum.VENDOR) {
      return true;
    }

    const Brand = await this._brandRepo.findOne({
      filter: { userId: user._id },
    });
    if (!Brand) {
      throw new NotFoundException('Brand not found');
    }
    if (!Brand.changeCredentialsTime) {
      throw new UnauthorizedException(
        'You must change your password before accessing this resource',
      );
    }
    return true;
  }
}
