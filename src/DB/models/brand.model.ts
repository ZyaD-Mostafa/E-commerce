import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import slugify from 'slugify';
import { HydratedDocument, Types } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Brand {
  constructor() {}

  @Prop({
    type: String,
    required: true,
    unique: true,
    minLength: 2,
    maxLength: 20,
  })
  name: string;
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'User',
  })
  createdBy: Types.ObjectId;

  @Prop({
    type: Object,
    required: true,
  })
  image: {
    secure_url?: string;
    public_id?: string;
  };

  @Prop({
    type: String,
    minLength: 2,
    maxLength: 20,
  })
  slug: string;

}

export const brandSchema = SchemaFactory.createForClass(Brand);

brandSchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
});
export type HBrandDocument = HydratedDocument<Brand>;
export const BrandModel = MongooseModule.forFeature([
  { name: Brand.name, schema: brandSchema },
]);
