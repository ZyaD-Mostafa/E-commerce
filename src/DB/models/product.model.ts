import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import slugify from 'slugify';
import { HydratedDocument, Types } from 'mongoose';
import { Category } from './category.model';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Product {
  constructor() {}

  @Prop({
    type: String,
    required: true,
    unique: true,
    minLength: 3,
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
    type: [Object],
    required: true,
  })
  image: {
    secure_url?: string;
    public_id?: string;
  }[];

  @Prop({
    type: String,
    unique: true,
    minLength: 3,
    maxLength: 20,
  })
  slug: string;
  @Prop({
    type: String,
    minlength: 10,
    maxlength: 5000,
  })
  description: string;

  @Prop({
    type: Types.ObjectId,
    ref: Category.name,
  })
  category: Types.ObjectId;

  @Prop({
    type: Number,
    min: 0,
    default: 0,
  })
  stock: number;
  @Prop({
    type: Number,
    required: true,
    
  })
  originalPrice: number;
  @Prop({
    type: Number,
    required: true,
    
  })
  salePrice: number;
  @Prop({
    type: Number,
    default: 0,
  })
  discount: number;
}

export const productSchema = SchemaFactory.createForClass(Product);

productSchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
});
export type HProductDocument = HydratedDocument<Product>;
export const ProductModel = MongooseModule.forFeature([
  { name: Product.name, schema: productSchema },
]);
