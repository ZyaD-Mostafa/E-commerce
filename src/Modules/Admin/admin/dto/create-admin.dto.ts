

import { z } from 'zod';

export const createAdminVendorDtoSchema = z.strictObject({
  username: z.string(),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'VENDOR']),
});

export type CreateAdminVendorDto = z.infer<typeof createAdminVendorDtoSchema>;