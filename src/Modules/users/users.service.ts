import { BadRequestException, Injectable } from '@nestjs/common';
import { LogOutDto, UpdateProfileDto } from './user.dto';
import { LogOutEnum } from 'src/common/enums/user.enums';
import { TokenService } from '../token/token.service';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/DB/models/user.model';
import { Model } from 'mongoose';
import { cloudinaryConfig } from 'src/common/multer/cloudinary.multer';

@Injectable()
export class UsersService {
  constructor(
    private readonly _tokenService: TokenService,
    @InjectModel(User.name) private readonly _userModel: Model<User>,
  ) {}
  async getProfile(req: any) {
    return {
      message: 'User profile',
      user: req.user,
    };
  }

  async profileImage(file: Express.Multer.File, req: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const oldPublicId = req.user.profileImage?.publicId;

    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
      file.path,
      {
        folder: `E-Commerce/users/${req.user._id}`,
      },
    );
    const user = await this._userModel.updateOne(
      { _id: req?.user?._id },
      {
        $set: {
          profileImage: {
            secure_url,
            public_id,
          },
        },
      },
    );
    if (oldPublicId) {
      await cloudinaryConfig().uploader.destroy(oldPublicId);
    }
    return {
      message: 'profile image updated',
      user,
    };
  }

 async uploadFiles(files: Array<Express.Multer.File[]>, req: any) {
  if (!files || !req.files || req.files.length === 0) {
    throw new BadRequestException('No files uploaded');
  }

  const attachments: { public_id: string; secure_url: string }[] = [];
  const oldImages: { public_id?: string; secure_url?: string }[] = req.user.coverImage || [];

  // رفع الملفات الجديدة
  for (const file of req.files) {
    const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(file.path, {
      folder: `Sara7aApp/Users/${req.user._id}`,
    });
    attachments.push({ public_id, secure_url });
  }

  // مسح الصور القديمة لو موجودة
  for (const old of oldImages) {
    if (old.public_id) {
      await cloudinaryConfig().uploader.destroy(old.public_id);
    }
  }

  // تحديث الـ DB
  const user = await this._userModel.updateOne(
    { _id: req.user._id },
    { $set: { coverImage: attachments } }
  );

  return {
    message: 'Files uploaded successfully',
    user,
  };
}


  async logout(body: LogOutDto, req: any) {
    const { flag } = body;
    let statusCode = 200;
    switch (flag) {
      case LogOutEnum.ONLY:
        await this._tokenService.createRevokedToken(req.decoded);
        statusCode = 201;
        break;
      case LogOutEnum.ALL:
        await this._userModel.updateOne(
          { _id: req.user?._id },
          { $set: { changeCredintaialstime: new Date() } },
        );
        break;
      default:
        break;
    }
    return {
      message: 'User logged out',
    };
  }

  async updateProfile(body: UpdateProfileDto, req: any) {
    const user = await this._userModel.findOneAndUpdate(
      { _id: req.user._id },
      { $set: body },
      { new: true, runValidators: true },
    );
    return {
      message: 'User profile updated',
      user,
    };
  }
}
