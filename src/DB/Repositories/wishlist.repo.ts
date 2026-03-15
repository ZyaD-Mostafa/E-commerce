import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from './base.repo';
import { Model } from 'mongoose';
import { Wishlist, HwishlistDocument } from '../models/wishlist.model';

export class WishlistRepository extends BaseRepository<HwishlistDocument> {
  constructor(
    @InjectModel(Wishlist.name)
    private readonly wishlistModel: Model<HwishlistDocument>,
  ) {
    super(wishlistModel);
  }
}
