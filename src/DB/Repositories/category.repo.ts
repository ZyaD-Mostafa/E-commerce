import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from './base.repo';
import { Model } from 'mongoose';
import { Category, HCategoryDocument } from '../models/category.model';

export class CategoryRepository extends BaseRepository<HCategoryDocument> {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<HCategoryDocument>,
  ) {
    super(categoryModel);
  }
}
