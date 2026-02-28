import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Model } from 'mongoose';
import { Coupon } from 'src/DB/models/coupon.model';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CouponService {
  constructor(@InjectModel(Coupon.name) private couponModel: Model<Coupon>) {}
  async create(createCouponDto: CreateCouponDto, req: any) {
    const existsCoupon = await this.couponModel.findOne({
      code: createCouponDto.code,
    });
    if (existsCoupon) {
      throw new ConflictException('Coupon already exists');
    }
    const coupon = await this.couponModel.create({
      ...createCouponDto,
      createdBy: req.user.id,
    });
    return coupon;
  }

  findAll() {
    return `This action returns all coupon`;
  }

  findOne(id: number) {
    return `This action returns a #${id} coupon`;
  }

  update(id: number, updateCouponDto: UpdateCouponDto) {
    return `This action updates a #${id} coupon`;
  }

  remove(id: number) {
    return `This action removes a #${id} coupon`;
  }
}
