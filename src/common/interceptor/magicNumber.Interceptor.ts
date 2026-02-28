import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Type,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs';

export function MagicNumberInterceptor(
  allowedTypes: string[],
): Type<NestInterceptor> {
  @Injectable()
  class MagicNumberInterceptorMixin implements NestInterceptor {
    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<any>> {
      const req = context.switchToHttp().getRequest();
      const file = req.file;

      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      // قراءة الفايل من الديسك
      const buffer = fs.readFileSync(file.path);
      const type = await fileTypeFromBuffer(buffer);

      if (!type || !allowedTypes.includes(type.mime)) {
        throw new BadRequestException(
          `From magicnumber interceptor: Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
        );
      }

      return next.handle();
    }
  }

  return MagicNumberInterceptorMixin;
}
