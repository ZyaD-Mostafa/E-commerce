import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from './base.repo';
import { Model } from 'mongoose';
import { Cart, HCartDocument } from '../models/cart.model';

export class CartRepository extends BaseRepository<HCartDocument> {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<HCartDocument>,
  ) {
    super(cartModel);
  }
}
