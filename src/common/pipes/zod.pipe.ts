import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import type { ZodSchema, ZodIssue } from 'zod';

@Injectable()
export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue: ZodIssue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      console.log('❌ ZOD VALIDATION ERROR 👉', formattedErrors);

      throw new BadRequestException({
        message: 'validation failed',
        errors: formattedErrors,
      });
    }

    return result.data;
  }
}
