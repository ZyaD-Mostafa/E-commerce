import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.model';
import { Cart } from './cart.model';
import { required } from 'zod/mini';
import { Coupon } from './coupon.model';
import {
  OrderStatusEnum,
  paymentMethodEnum,
} from 'src/common/enums/user.enums';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Order {
  constructor() {}

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: User.name,
  })
  user: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: Cart.name,
  })
  cart: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
  })
  subTotal: number;

  @Prop({
    type: Number,
    default: 0,
  })
  discount: number;

  @Prop({
    type: Number,
    default: 0,
  })
  total: number;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: Coupon.name,
  })
  coupon?: Types.ObjectId;

  @Prop({
    type: String,
    enum: {
      values: Object.values(OrderStatusEnum),
      message: '{VALUE} is not a valid order status',
    },
    default: OrderStatusEnum.PLACED,
  })
  status: string;
  @Prop({
    type: String,
    enum: {
      values: Object.values(paymentMethodEnum),
      message: '{VALUE} is not a valid payment method',
    },
    default: paymentMethodEnum.CASH,
  })
  paymentMethod: string;

  @Prop({
    type: String,
    required: true,
  })
  address: string;

  @Prop({
    type: String,
    required: true,
  })
  phone: string;
  @Prop({
    type: String,
  })
  intentId: string;
  @Prop({
    type: String,
  })
  refundId: string;
  @Prop({
    type: Date,
  })
  refundAt: Date;
}

export const orderSchema = SchemaFactory.createForClass(Order);
export type HOrderDocument = HydratedDocument<Order>;
export const OrderModel = MongooseModule.forFeature([
  { name: Order.name, schema: orderSchema },
]);
