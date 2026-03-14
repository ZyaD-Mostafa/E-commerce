import { z } from 'zod';
import { createCategoryDtoSchema } from './create-category.dto';
import { Types } from 'mongoose';

export const updateCategoryDtoSchema = createCategoryDtoSchema.partial();

export const addbrandToCategoryDtoSchema = z.strictObject({
  brandId: z.string().refine((value) => Types.ObjectId.isValid(value), {
    message: 'Brand ID must be a valid ObjectId',
  }),
});

export type UpdateCategoryDto = z.infer<typeof updateCategoryDtoSchema>;
export type AddbrandToCategoryDto = z.infer<typeof addbrandToCategoryDtoSchema>;
