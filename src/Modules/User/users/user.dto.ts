import { z } from 'zod';
import { LogOutEnum } from 'src/common/enums/user.enums';
import { generalField } from 'src/common/utils/generalField.utils';

export const logOutSchema = z.strictObject({
  flag: z.enum([LogOutEnum.ONLY, LogOutEnum.ALL]).default(LogOutEnum.ONLY),
});
export const updateProfileSchema = z.strictObject({
  firstname: generalField.firstname.optional(),
  lastname: generalField.lastname.optional(),
});

export const updatePasswordSchema = z
  .strictObject({
    password: generalField.password,
    newPassword: generalField.password,
    confirmPassword: generalField.confirmPassword,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LogOutDto = z.infer<typeof logOutSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordDto = z.infer<typeof updatePasswordSchema>;
