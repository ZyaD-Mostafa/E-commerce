import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from './base.repo';
import { Model } from 'mongoose';
import { HTokenDocument, Token } from '../models/token.model';

export class TokenRepository extends BaseRepository<HTokenDocument> {
  constructor(
    @InjectModel(Token.name)
    private readonly tokenModel: Model<HTokenDocument>,
  ) {
    super(tokenModel);
  }
}
