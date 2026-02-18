import { GenderEnum, ProviderEnum } from 'src/common/enums/user.enums';
import { z } from 'zod';
import { generakField } from 'src/common/utils/generalField.utils';

export const creteUserSchema = z
  .object({
    firstname: generakField.firstname,
    lastname: generakField.lastname,
    email: generakField.email,
    password: generakField.password,
    confirmPassword: generakField.confirmPassword,
    gender: z.enum(GenderEnum).optional(),
    provider: z.enum(ProviderEnum).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const resendOtpSchema = z.strictObject({
  email: generakField.email,
});
export const confrimEmailSchema = z.strictObject({
  email: generakField.email,
  code: generakField.otp,
});
export const loginSchema = z.strictObject({
  email: generakField.email,
  password: generakField.password,
});

export type CreateUserDto = z.infer<typeof creteUserSchema>;
export type ResendOtpDto = z.infer<typeof resendOtpSchema>;
export type ConfrimEmailDto = z.infer<typeof confrimEmailSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
