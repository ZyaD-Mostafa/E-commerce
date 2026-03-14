import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { BrandRepository } from 'src/DB/Repositories/brand.repo';
import { UserRepository } from 'src/DB/Repositories/user.repo';
import { UserRoleEnum } from '../enums/user.enums';

@Injectable()
export class brandCredentials implements CanActivate {
  constructor(
    private readonly _userRepo: UserRepository,
    private readonly _brandRepo: BrandRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
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
