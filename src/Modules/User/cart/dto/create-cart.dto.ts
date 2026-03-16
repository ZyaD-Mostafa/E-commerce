import { z } from 'zod';
import { Types } from 'mongoose';

export const cartItemSchema = z.object({
  product: z
    .string()
    .refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid product id',
    }),

  variantId: z.string().optional(),

  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
});

export type CreateCartDto = z.infer<typeof cartItemSchema>;
