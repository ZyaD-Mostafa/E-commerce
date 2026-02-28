import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.model';
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Coupon {
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  })
  code: string;

  @Prop({
    type: Number,
    required: true,
    min: 0,
    max: 100,
  })
  discountPersentage: number;

  @Prop({
    type: Date,
    required: true,
  })
  expireAt: Date;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
  })
  createdBy: Types.ObjectId;
}

export const couponSchema = SchemaFactory.createForClass(Coupon);
couponSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
export type HCouponDocument = HydratedDocument<Coupon>;
export const CouponModel = MongooseModule.forFeature([
  { name: Coupon.name, schema: couponSchema },
]);
