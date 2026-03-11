import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from './base.repo';
import { Model } from 'mongoose';
import { HUserDocument, User } from '../models/user.model';

export class UserRepository extends BaseRepository<HUserDocument> {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<HUserDocument>,
  ) {
    super(userModel);
  }
}
