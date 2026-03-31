import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import slugify from 'slugify';
import { HydratedDocument, Types } from 'mongoose';
import { Category } from './category.model';
import { Brand } from './brand.model';
import { v4 as uuid } from 'uuid';

@Schema({ _id: false }) // مهم عشان متاخدش ObjectId لوحدها
export class Variant {

  @Prop()
  id?: string;
  @Prop({ required: true })
  name: string; // مثال: Size M / 500ml

  @Prop({ required: true })
  originalPrice: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop()
  salePrice?: number;

  @Prop({ default: 0 })
  stock: number;

  @Prop({ type: Map, of: String })
  attributes?: Record<string, string>;
  // مثال: { size: "M", color: "Black" }
}

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
    ref: Brand.name,
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
    minlength: 3,
    maxlength: 50000,
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
  stock?: number;
  @Prop({
    type: Number,
  })
  originalPrice?: number;
  @Prop({
    type: Number,
  })
  salePrice?: number;
  @Prop({
    type: Number,
    default: 0,
  })
  discount?: number;

  // 👇 Variant-based product
  @Prop({ type: [Variant], default: [] })
  variants?: Variant[];
}

export const productSchema = SchemaFactory.createForClass(Product);

productSchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
});

productSchema.pre('save', async function () {
  // ✅ Variant product
 if (this.variants && this.variants.length > 0) {
    this.variants.forEach((variant, index) => {
      const pricePath = `variants.${index}.originalPrice`;
      const discountPath = `variants.${index}.discount`;

      if (
        this.isModified(pricePath) ||
        this.isModified(discountPath)
      ) {
        variant.salePrice =
          variant.originalPrice -
          (variant.originalPrice * (variant.discount || 0)) / 100;
      }

      if (!variant.id) {
        variant.id = uuid();
      }
    });

    return
  }



  // ✅ Simple product
  if (this.originalPrice) {
    this.salePrice =
      this.originalPrice - (this.originalPrice * (this.discount || 0)) / 100;
  }

  return;
});


export type HProductDocument = HydratedDocument<Product>;
export const ProductModel = MongooseModule.forFeature([
  { name: Product.name, schema: productSchema },
]);
