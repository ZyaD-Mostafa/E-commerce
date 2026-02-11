import { GenderEnum, ProviderEnum } from 'src/common/enums/user.enums';
import { z } from 'zod';

export const creteUserSchema = z
  .object({
    firstname: z.string().min(3).max(50),
    lastname: z.string().min(3).max(50),
    email: z.email(),
    password: z.string(),
    confirmPassword: z.string(),
    gender: z.enum(GenderEnum).optional(),
    provider: z.enum(ProviderEnum).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const resendOtpSchema = z.strictObject({
  email: z.email(),
});
export const confrimEmailSchema = z.strictObject({
  email: z.email(),
  code: z.string().length(6),
});
export const loginSchema = z.strictObject({
  email: z.email(),
  password: z.string(),
});

export type CreateUserDto = z.infer<typeof creteUserSchema>;
export type ResendOtpDto = z.infer<typeof resendOtpSchema>;
export type ConfrimEmailDto = z.infer<typeof confrimEmailSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
