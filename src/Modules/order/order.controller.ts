import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AccessRoleGuard } from 'src/common/guard/accessRole.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { UserRoleEnum } from 'src/common/enums/user.enums';
import {  type HUserDocument } from 'src/DB/models/user.model';


@UseGuards(AuthGuard, AccessRoleGuard)
@Roles([UserRoleEnum.USER])
@Controller('order')
export class OrderController {
  constructor( 
    private readonly orderService: OrderService, 
    
  ) {}

  @Post()
  create(@Body(new ValidationPipe()) createOrderDto: CreateOrderDto, @Req() req: any) {
    return this.orderService.create(createOrderDto , req);
  }

  @Post('cancel/:id')
  cancel(@Param('id') id: string, @Req() req: Request) {
    return this.orderService.cancelOrder(id, req);
  }


  @Post('checkout/:orderId')
  creatCheckOutSession(@Param('orderId') orderId: string, @Req() req: Request , user :HUserDocument) {
    return this.orderService.createCheckOutSession(orderId, req , user );
  }
}
