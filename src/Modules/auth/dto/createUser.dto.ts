import { GenderEnum, ProviderEnum } from 'src/common/enums/user.enums';
import { z } from 'zod';
import { generalField } from 'src/common/utils/generalField.utils';

export const creteUserSchema = z
  .object({
    firstname: generalField.firstname,
    lastname: generalField.lastname.optional(),
    email: generalField.email,
    password: generalField.password,
    confirmPassword: generalField.confirmPassword,
    gender: z.enum(GenderEnum).optional(),
    provider: z.enum(ProviderEnum).optional(),
    phone: generalField.phone.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const resendOtpSchema = z.strictObject({
  email: generalField.email,
});
export const confrimEmailSchema = z.strictObject({
  email: generalField.email,
  code: generalField.otp,
});
export const loginSchema = z.strictObject({
  email: generalField.email,
  password: generalField.password,
});

export type CreateUserDto = z.infer<typeof creteUserSchema>;
export type ResendOtpDto = z.infer<typeof resendOtpSchema>;
export type ConfrimEmailDto = z.infer<typeof confrimEmailSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
