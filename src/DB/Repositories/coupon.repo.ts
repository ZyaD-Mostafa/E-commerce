import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from './base.repo';
import { Model } from 'mongoose';
import { Coupon, HCouponDocument } from '../models/coupon.model';

export class CouponRepository extends BaseRepository<HCouponDocument> {
  constructor(
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<HCouponDocument>,
  ) {
    super(couponModel);
  }
}
