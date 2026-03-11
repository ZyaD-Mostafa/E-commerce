import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Model, Types } from 'mongoose';
import { Coupon } from 'src/DB/models/coupon.model';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { CouponRepository } from 'src/DB/Repositories/coupon.repo';

@Injectable()
export class CouponService {
  constructor(private readonly _couponRepo: CouponRepository) {}
  async create(createCouponDto: CreateCouponDto, req: Request) {
    const existsCoupon = await this._couponRepo.findOne({
      filter: { code: createCouponDto.code },
    });
    if (existsCoupon) {
      throw new ConflictException('Coupon already exists');
    }
    const coupon = await this._couponRepo.create({
      ...createCouponDto,
      createdBy: new Types.ObjectId(req.user?.id),
    });
    return coupon;
  }

  
}
