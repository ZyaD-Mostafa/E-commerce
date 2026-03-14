import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LogOutDto, UpdatePasswordDto, UpdateProfileDto } from './user.dto';
import { LogOutEnum, UserRoleEnum } from 'src/common/enums/user.enums';
import { TokenService } from '../../token/token.service';
import { Request } from 'express';
import { UserRepository } from 'src/DB/Repositories/user.repo';
import { compareHash, hash } from 'src/common/utils/hashing/hash';
import { BrandRepository } from 'src/DB/Repositories/brand.repo';

@Injectable()
export class UsersService {
  constructor(
    private readonly _tokenService: TokenService,
    private readonly _userRepository: UserRepository,
    private readonly _brandRepository: BrandRepository,
  ) {}
  async getProfile(req: Request) {
    return {
      message: 'User profile',
      user: req.user,
    };
  }

  // async profileImage(file: Express.Multer.File, req: Request) {
  //   if (!file) {
  //     throw new BadRequestException('No file uploaded');
  //   }
  //   const oldPublicId = req.user?.profileImage?.public_id;

  //   const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
  //     file.path,
  //     {
  //       folder: `E-Commerce/users/${req.user._id}`,
  //     },
  //   );
  //   const user = await this._userRepository.updateOne({
  //     filter: {
  //       _id: req?.user?._id,
  //     },
  //     update: {
  //       $set: {
  //         profileImage: {
  //           secure_url,
  //           public_id,
  //         },
  //       },
  //     },
  //   });

  //   if (oldPublicId) {
  //     await cloudinaryConfig().uploader.destroy(oldPublicId);
  //   }
  //   return {
  //     message: 'profile image updated',
  //     user,
  //   };
  // }

  // async uploadFiles(files: Array<Express.Multer.File[]>, req: any) {
  //   if (!files || !req.files || req.files.length === 0) {
  //     throw new BadRequestException('No files uploaded');
  //   }

  //   const attachments: { public_id: string; secure_url: string }[] = [];
  //   const oldImages: { public_id?: string; secure_url?: string }[] =
  //     req.user.coverImage || [];

  //   // رفع الملفات الجديدة
  //   for (const file of req.files) {
  //     const { public_id, secure_url } =
  //       await cloudinaryConfig().uploader.upload(file.path, {
  //         folder: `Sara7aApp/Users/${req.user._id}`,
  //       });
  //     attachments.push({ public_id, secure_url });
  //   }

  //   // مسح الصور القديمة لو موجودة
  //   for (const old of oldImages) {
  //     if (old.public_id) {
  //       await cloudinaryConfig().uploader.destroy(old.public_id);
  //     }
  //   }

  //   // تحديث الـ DB
  //   const user = await this._userRepository.updateOne({
  //     filter: { _id: req.user._id },
  //     update: { $set: { coverImage: attachments } },
  //   });

  //   return {
  //     message: 'Files uploaded successfully',
  //     user,
  //   };
  // }

  async logout(body: LogOutDto, req: any) {
    const { flag } = body;
    let statusCode = 200;
    switch (flag) {
      case LogOutEnum.ONLY:
        await this._tokenService.createRevokedToken(req.decoded);
        statusCode = 201;
        break;
      case LogOutEnum.ALL:
        await this._userRepository.updateOne({
          filter: { _id: req.user?._id },
          update: { $set: { changeCredintaialstime: new Date() } },
        });
        break;
      default:
        break;
    }
    return {
      message: 'User logged out',
    };
  }

  async updateProfile(body: UpdateProfileDto, req: any) {
    const user = await this._userRepository.findOneAndUpdate({
      filter: { _id: req.user._id },
      update: { $set: body },
      options: { runValidators: true },
    });
    return {
      message: 'User profile updated',
      user,
    };
  }

  async updatePassword(body: UpdatePasswordDto, req: any) {
    const user = await this._userRepository.findOne({
      filter: { _id: req.user._id },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (!(await compareHash(body.password, user.password))) {
      throw new BadRequestException('Current password is incorrect');
    }
    if (user.role === UserRoleEnum.VENDOR) {
      const brand = await this._brandRepository.findOne({
        filter: { userId: req.user._id },
      });
      if (!brand) {
        throw new NotFoundException('Brand not found');
      }

      brand.changeCredentialsTime = new Date();
      await brand.save();
    }
    user.password = body.newPassword; // 👈 plain
    await user.save(); // 👈 pre-save hook هيعمل hash
    return {
      message: 'User password updated',
      user,
    };
  }
}
