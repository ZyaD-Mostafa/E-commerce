import { Types } from 'mongoose';
import { z } from 'zod';

export const createProductDtoSchema = z.strictObject({
  name: z.string(),
  description: z.string(),
  originalPrice: z.coerce.number().positive(),
  discount: z.coerce.number().min(0).max(100).default(0),
  stock: z.coerce.number().min(0),
  category: z.string().refine((value) => Types.ObjectId.isValid(value), {
    message: 'Category must be a valid ObjectId',
  }),
});


export type CreateProductDto = z.infer<typeof createProductDtoSchema>;