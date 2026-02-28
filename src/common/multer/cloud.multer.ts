import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multer from 'multer';
import { BadRequestException } from '@nestjs/common';
import * as os from 'os';

export const fileValidation = {
  images: ['image/jpeg', 'image/png', 'image/jpg'],
  audio: ['audio/mp3', 'audio/wav', 'audio/mpeg'],
  video: ['video/mp4', 'video/mpeg', 'video/quicktime'],
};

type FileType = keyof typeof fileValidation;

/**
 * factory function
 * عشان نحدد نوع الملفات (images | audio | video)
 */
export const cloudFileUploadMulter = (type: FileType): MulterOptions => {
  return {
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, os.tmpdir()); // فولدر temp الخاص بالنظام
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
      },
    }),
    limits: {
      fileSize: 1024 * 1024 * 5, // 5MB
    },
    fileFilter: (req, file, cb) => {
      if (!fileValidation[type].includes(file.mimetype)) {
        cb(
          new BadRequestException(
            `Invalid file type. Allowed types: ${fileValidation[type].join(
              ', ',
            )}`,
          ),
          false,
        );
      } else {
        cb(null, true);
      }
    },
  };
};
