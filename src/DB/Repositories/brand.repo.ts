import { BaseRepository } from './base.repo';
import { Model } from 'mongoose';
import { Brand, HBrandDocument } from '../models/brand.model';
import { InjectModel } from '@nestjs/mongoose';

export class BrandRepository extends BaseRepository<HBrandDocument> {
  constructor(
    @InjectModel(Brand.name)
    private readonly brandModel: Model<HBrandDocument>,
  ) {
    super(brandModel);
  }
}
