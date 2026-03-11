import { Types } from 'mongoose';
import { z } from 'zod';

export const updateCategoryDtoSchema = z.strictObject({
  name: z.string().min(2).max(20).optional().optional(),
  description: z.string().min(10).max(5000).optional(),

  brands: z
    .preprocess((value) => {
      if (typeof value === 'string') {
        try {
          // لو جاية JSON string
          return JSON.parse(value);
        } catch {
          // لو جاية CSV "id1,id2"
          return value.split(',').map((v) => v.trim());
        }
      }
      return value;
    }, z.array(z.string()))
    .refine((data) => data.every((id) => Types.ObjectId.isValid(id)), {
      message: 'Invalid brand ID',
    })
    .optional(),
});

export type UpdateCategoryDto = z.infer<typeof updateCategoryDtoSchema>;
