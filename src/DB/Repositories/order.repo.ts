import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from './base.repo';
import { Model } from 'mongoose';
import { HOrderDocument, Order } from '../models/order.model';

export class OrderRepository extends BaseRepository<HOrderDocument> {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<HOrderDocument>,
  ) {
    super(orderModel);
  }
}
