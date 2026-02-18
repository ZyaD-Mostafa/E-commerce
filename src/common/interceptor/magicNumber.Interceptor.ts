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
      const files = req.files;

      if (!file && !files) {
        throw new BadRequestException('No file uploaded');
      }

      if (file) {
        // read the file from disk (or memory)
        const buffer = fs.readFileSync(file.path);

        const type = await fileTypeFromBuffer(buffer);

        if (!type || !allowedTypes.includes(type.mime)) {
          throw new BadRequestException(
            `From magicnumber interceptor: Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
          );
        }
      }

      let buffers: Buffer[] = [];
      if (files) {
        for (const file of files) {
          buffers.push(fs.readFileSync(file.path));
        }
      }

      for (const i of buffers) {
        const type = await fileTypeFromBuffer(i);
        if (!type || !allowedTypes.includes(type.mime)) {
          throw new BadRequestException(
            `From magicnumber interceptor: Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
          );
        }
      }

      return next.handle();
    }
  }

  return MagicNumberInterceptorMixin;
}
