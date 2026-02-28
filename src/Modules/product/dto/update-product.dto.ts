import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto, createProductDtoSchema } from './create-product.dto';
import { z } from 'zod';

export const UpdateProductSchemaDto = createProductDtoSchema.partial();

export type UpdateProductDto = z.infer<typeof UpdateProductSchemaDto>;
