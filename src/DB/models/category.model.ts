import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import slugify from 'slugify';
import { HydratedDocument, Types } from 'mongoose';
import { Brand } from './brand.model';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Category {
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

  })
  image: {
    secure_url?: string;
    public_id?: string;
  };

  @Prop({
    type: String,
    unique: true,
    minLength: 2,
    maxLength: 20,
  })
  slug: string;
  @Prop({
    type: String,
    minlength: 2,
    maxlength: 50000,
  })
  description: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: Brand.name }],
  })
  brands: Types.ObjectId[];
}

export const categorySchema = SchemaFactory.createForClass(Category);

categorySchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
});
categorySchema.set('optimisticConcurrency', true);
export type HCategoryDocument = HydratedDocument<Category>;
export const CategoryModel = MongooseModule.forFeature([
  { name: Category.name, schema: categorySchema },
]);
