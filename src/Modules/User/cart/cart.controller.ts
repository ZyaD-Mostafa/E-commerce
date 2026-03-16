import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { cartItemSchema, type CreateCartDto } from './dto/create-cart.dto';
import { AccessRoleGuard } from 'src/common/guard/accessRole.guard';
import { UserRoleEnum } from 'src/common/enums/user.enums';
import { Roles } from 'src/common/decorator/role.decorator';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { ZodPipe } from 'src/common/pipes/zod.pipe';
import { type Request } from 'express';
@UseGuards(AuthGuard, AccessRoleGuard)
@Roles([UserRoleEnum.USER])
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addToCart(@Body(new ZodPipe(cartItemSchema)) CreateCartDto: CreateCartDto , @Req() req:Request) {
    return this.cartService.addToCart(CreateCartDto , req);
  }

  @Get('')
  findOne(@Req() req:Request) {
    return this.cartService.findOne(req);
  }

  @Patch('/apply-coupon')
  applayCoupon(@Body('code') code :string , @Req() req:Request){
    return this.cartService.applayCoupon(req , code);

  }
  
  @Patch(':productId')
  updateCart(@Param('productId') productId: string, @Body('quantity') quantity: number , @Req() req:Request , @Body('variantId') variantId?: string) {
    return this.cartService.updateCart(productId, quantity , req, variantId);
  }

  @Delete('/:productId')
  removeItem(@Param('productId') productId: string , @Req() req:Request , @Body('variantId') variantId?: string) {
    return this.cartService.removeItem(productId , req, variantId);
  }

  
}
