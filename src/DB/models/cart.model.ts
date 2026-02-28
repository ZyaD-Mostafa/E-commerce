import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Product } from './product.model';
import { User } from './user.model';

@Schema({ _id: false })
export class CartItem {
  @Prop({ type: Types.ObjectId, required: true, ref: Product.name })
  product: Types.ObjectId;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  total: number;
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Cart {
  constructor() {}

  @Prop({ type: [CartItem], default: [] })
  items: CartItem[];

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: User.name,
    unique: true,
  })
  user: Types.ObjectId;

  @Prop({
    type: Number,
    default: 0,
  })
  subTotal: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'Coupon',
  })
  coupon?: Types.ObjectId | null;

  @Prop({
    type: Number,
    default: 0,
  })
  discount?: number | null;

  @Prop({
    type: Number,
    default: 0,
  })
  totalAfterDiscount?: number;
}

export const cartSchema = SchemaFactory.createForClass(Cart);
export type HCartDocument = HydratedDocument<Cart>;
export const CartModel = MongooseModule.forFeature([
  { name: Cart.name, schema: cartSchema },
]);
