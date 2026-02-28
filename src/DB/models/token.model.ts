import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.model';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Token {
  constructor() {}

  @Prop({
    type: String,
    required: true,
  })
  jti: string;
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: User.name,
  })
  userId: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
  })
  expiresIn: number;
}

export const tokenSchema = SchemaFactory.createForClass(Token);


tokenSchema.index({ expiresIn: 1 }, { expireAfterSeconds: 0 });
export type HTokenDocument = HydratedDocument<Token>;
export const TokenModel = MongooseModule.forFeature([
  { name: Token.name, schema: tokenSchema },
]);
