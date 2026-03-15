import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AccessRoleGuard } from 'src/common/guard/accessRole.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { UserRoleEnum } from 'src/common/enums/user.enums';
import { type Request } from 'express';
import { type WishlistDto } from './wishList.Dto';

@UseGuards(AuthGuard, AccessRoleGuard)
@Roles([UserRoleEnum.USER])
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  async addToWishlist(@Body() product: WishlistDto, @Req() req: Request) {
    return this.wishlistService.addToWishlist(product.product, req);
  }

  @Get()
  async getWishlist(@Req() req: Request) {
    return this.wishlistService.getWishlist(req);
  }
}
