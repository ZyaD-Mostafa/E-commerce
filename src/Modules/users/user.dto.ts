import { z } from 'zod';
import { LogOutEnum } from 'src/common/enums/user.enums';
import { generakField } from 'src/common/utils/generalField.utils';

export const logOutSchema = z.strictObject({
  flag: z.enum([LogOutEnum.ONLY, LogOutEnum.ALL]).default(LogOutEnum.ONLY),
});
export const updateProfileSchema = z.strictObject({
  firstname: generakField.firstname.optional(),
  lastname: generakField.lastname.optional(),
});

export type LogOutDto = z.infer<typeof logOutSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
