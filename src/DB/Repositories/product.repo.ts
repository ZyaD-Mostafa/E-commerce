import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from './base.repo';
import { Model } from 'mongoose';
import { HProductDocument, Product } from '../models/product.model';

export class ProductRepository extends BaseRepository<HProductDocument> {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<HProductDocument>,
  ) {
    super(productModel);
  }
}
