import { PartialType } from '@nestjs/mapped-types';
import { createAdminVendorDtoSchema } from './create-admin.dto';

export const updateAdminVendorDtoSchema = createAdminVendorDtoSchema.partial();
