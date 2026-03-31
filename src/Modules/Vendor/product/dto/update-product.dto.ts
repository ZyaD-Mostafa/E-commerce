
import { z } from 'zod';

export const UpdateProductSchemaDto = z.strictObject({
  name: z.string().optional(),
  description: z.string().optional(),
  originalPrice: z.coerce.number().positive().optional(),
  discount: z.coerce.number().min(0).max(100).default(0).optional(),
  stock: z.coerce.number().min(0).optional(),
  variantId: z.string().optional(),
});
export type UpdateProductDto = z.infer<typeof UpdateProductSchemaDto>;
