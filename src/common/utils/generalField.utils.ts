import { Types } from 'mongoose';
import { z } from 'zod';

export const generalField = {
  firstname: z.string().min(3).max(50),
  lastname: z.string().min(3).max(50),
  email: z.email(),
  password: z
    .string()
    .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/), // ex : Password123!
  confirmPassword: z.string(),
  otp: z.string().regex(/^\d{6}$/),
  phone: z.string(),
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
        { error: 'please provide a file ' },
      );
  },
};
