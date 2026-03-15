import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Product } from './product.model';
import { User } from './user.model';

@Schema({ _id: false })
export class WishItem {
  @Prop({ type: Types.ObjectId, required: true, ref: Product.name })
  product: Types.ObjectId;
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
export class Wishlist {
  constructor() {}

  @Prop({ type: [WishItem], default: [] })
  items: WishItem[];

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: User.name,
    unique: true,
  })
  user: Types.ObjectId;
}

export const wishlistSchema = SchemaFactory.createForClass(Wishlist);
export type HwishlistDocument = HydratedDocument<Wishlist>;
export const WishlistModel = MongooseModule.forFeature([
  { name: Wishlist.name, schema: wishlistSchema },
]);
