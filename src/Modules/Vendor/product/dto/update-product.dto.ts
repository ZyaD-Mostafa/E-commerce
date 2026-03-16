import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto, createProductDtoSchema, variantSchema } from './create-product.dto';
import { z } from 'zod';
import { Types } from 'mongoose';

export const UpdateProductSchemaDto = z
  .strictObject({
    name: z.string(),
    description: z.string().optional(),
    originalPrice: z.coerce.number().positive().optional(),
    discount: z.coerce.number().min(0).max(100).default(0).optional(),
    stock: z.coerce.number().min(0).optional(),
    category: z.string().refine((value) => Types.ObjectId.isValid(value), {
      message: 'Category must be a valid ObjectId',
    }),
    variants: z.array(variantSchema).optional(),
  })
  .refine(
    (data) => {
      const isSimple =
        data.originalPrice !== undefined && data.stock !== undefined;

      const isVariant = data.variants !== undefined && data.variants.length > 0;

      // لازم واحد بس
      return isSimple !== isVariant;
    },
    {
      message:
        'Product must be either simple (price & stock) or variant-based (variants array)',
      path: ['variants'],
    },
  );
export type UpdateProductDto = z.infer<typeof UpdateProductSchemaDto>;
