import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from 'src/DB/models/order.model';
import { Cart, HCartDocument } from 'src/DB/models/cart.model';
import {
  OrderStatusEnum,
  paymentMethodEnum,
} from 'src/common/enums/user.enums';
import { HUserDocument } from 'src/DB/models/user.model';
import { PaymentService } from 'src/common/Services/payment/payment.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    private readonly paymentService: PaymentService,
  ) {}
  async create(createOrderDto: CreateOrderDto, req: any) {
    // cartId , address,
    const cart = await this.cartModel.findOne({
      _id: new Types.ObjectId(createOrderDto.cartId),
      user: req.user._id.toString(),
    });
    if (!cart) throw new BadRequestException('Cart not found');
    if (cart.items.length <= 0) throw new BadRequestException('Cart is empty');

    const order = await this.orderModel.create({
      user: req.user._id,
      cart: cart._id,
      address: createOrderDto.address,
      subTotal: cart.subTotal,
      discount: cart.discount || 0,
      total: cart.totalAfterDiscount || cart.subTotal,
      coupon: cart.coupon?._id,
      status: OrderStatusEnum.PLACED,
      paymentMethod: paymentMethodEnum.CASH,
      phone: createOrderDto.phone,
    });
    if (!order) throw new BadRequestException('Order not created');

    // TODO: send email to user ( feuter )
    cart.items = [];
    cart.subTotal = 0;
    cart.discount = 0;
    cart.totalAfterDiscount = 0;
    cart.coupon = null;
    await cart.save();

    return order;
  }

  async cancelOrder(id: string, req: any) {
    const order = await this.orderModel.findOne({
      _id: new Types.ObjectId(id),
      user: req.user._id.toString(),
    });
    if (!order) throw new BadRequestException('Order not found');
    if (
      order.status == OrderStatusEnum.DELIVERED ||
      order.status == OrderStatusEnum.SHIPPED ||
      order.status == OrderStatusEnum.CANCELLED
    )
      throw new BadRequestException(
        'Order already shipped, delivery or cancelled',
      );
    order.status = OrderStatusEnum.CANCELLED;
    await order.save();
    return order;
  }

  async createCheckOutSession(orderId: string, req: any, user: HUserDocument) {
    const order = await this.orderModel
      .findOne({
        _id: new Types.ObjectId(orderId),
        user: new Types.ObjectId(req.user._id),
        status: {
          $in: [
            OrderStatusEnum.PLACED,
            OrderStatusEnum.PENDING,
            OrderStatusEnum.PROCESSING,
          ],
        },
        paymentMethod: paymentMethodEnum.CARD,
      })
      .populate([{ path: 'user' }, { path: 'cart' }, { path: 'coupon' }]);
    if (!order) throw new BadRequestException('Order not found');

    // TODO: create checkout session

    const amount = order.total ?? order.subTotal ?? 0;
    const line_items = [
      {
        price_data: {
          currency: 'egp',
          product_data: {
            name: `Order ${(order.user as unknown as HUserDocument).firstname}`,
            description: `Payment for order on address ${order.address}`,
          },
          unit_amount: amount * 100,
        },
        quantity: (order.cart as unknown as HCartDocument).items?.length || 1,
      },
    ];

    const session = await this.paymentService.checkOutSession({
      customer_email: (order.user as unknown as HUserDocument).email,
      line_items,
      mode: 'payment',
      metadata: {
        orderId: order._id.toString(),
      },
    });
    return session;
  }
}
