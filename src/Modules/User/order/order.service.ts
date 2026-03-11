import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HCartDocument } from 'src/DB/models/cart.model';
import {
  OrderStatusEnum,
  paymentMethodEnum,
} from 'src/common/enums/user.enums';
import { HUserDocument } from 'src/DB/models/user.model';
import { PaymentService } from 'src/common/Services/payment/payment.service';
import Stripe from 'stripe';
import { CartRepository } from 'src/DB/Repositories/cart.repo';
import { OrderRepository } from 'src/DB/Repositories/order.repo';

@Injectable()
export class OrderService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly orderRepo: OrderRepository,
    private readonly cartRepo: CartRepository,
  ) {}
  async create(createOrderDto: CreateOrderDto, req: any) {
    // cartId , address,
    const cart = await this.cartRepo.findOne({
      filter: {
        _id: new Types.ObjectId(createOrderDto.cartId),
        user: req.user._id.toString(),
      },
    });
    if (!cart) throw new BadRequestException('Cart not found');
    if (cart.items.length <= 0) throw new BadRequestException('Cart is empty');

    const order = await this.orderRepo.create({
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
    const order = await this.orderRepo.findOne({
      filter: {
        _id: new Types.ObjectId(id),
        user: req.user._id.toString(),
      },
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

  async createCheckOutSession(orderId: string, req: any) {
    const order = await this.orderRepo.findOne({
      filter: {
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
      },
      options: {
        populate: [{ path: 'user' }, { path: 'cart' }, { path: 'coupon' }],
      },
    });
    if (!order) throw new NotFoundException('Order not found');

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

    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    if (order.discount) {
      const coupon = await this.paymentService.createCoupon({
        duration: 'once',
        currency: 'egp',
        percent_off: order.discount,
      });
      discounts.push({
        coupon: coupon.id,
      });
    }

    const session = await this.paymentService.checkOutSession({
      customer_email: (order.user as unknown as HUserDocument).email,
      line_items,
      mode: 'payment',
      discounts,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    const method = await this.paymentService.createPaymentMethod({
      type: 'card',
      card: { token: 'tok_visa' },
    });
    const intent = await this.paymentService.createPaymentIntent({
      amount: order.subTotal * 100,
      currency: 'egp',
      payment_method: method.id,
      payment_method_types: ['card'],
    });
    order.intentId = intent.id;
    await order.save();

    await this.paymentService.confirmPaymentIntent(intent.id);
    return session.url;
  }

  async refundOrder(orderId: string, req: any) {
    const order = await this.orderRepo.findOne({
      filter: {
        _id: new Types.ObjectId(orderId),
        user: new Types.ObjectId(req.user._id),
        paymentMethod: paymentMethodEnum.CARD,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (!order.intentId)
      throw new BadRequestException('Order has no intent id');

    const refund = await this.paymentService.createRefund(order.intentId);
    await this.orderRepo.findByIdAndUpdate({
      id: order._id,
      update: {
        status: OrderStatusEnum.REFUNDED,
        refundId: refund.id,
        refundAt: new Date(),
        $unset: { intentId: 1 },
        $inc: { __v: 1 },
      },
      options: { runValidators: true },
    });

    return order;
  }
}
