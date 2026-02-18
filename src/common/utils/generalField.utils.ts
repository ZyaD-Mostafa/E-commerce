import { Types } from 'mongoose';
import { z } from 'zod';

export const generakField = {
  firstname: z.string().min(3).max(50),
  lastname: z.string().min(3).max(50),
  email: z.email(),
  password: z.string().min(6, { error: 'password must be 6 char long' }),
  confirmPassword: z
    .string()
    .min(6, { error: 'confirmPassword must be 6 char long' }),
  otp: z.string().regex(/^\d{6}$/),
  id: z.string().refine((data) => {
    return Types.ObjectId.isValid(data);
  }, 'Invalid ID format'),

    file: function (minetype: string[]) {
    return z
      .strictObject({
        fieldname: z.string(),
        originalname: z.string(),
        mimetype: z.enum(minetype),
        size: z.number(),
        buffer: z.any().optional(),
        path: z.string().optional(),
      })
      .refine(
        (data) => {
          return data.path || data.buffer;
        },
        { error: "please provide a file " },
      );
  },
};
