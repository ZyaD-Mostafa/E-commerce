import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Types } from 'mongoose';
import { cloudinaryConfig } from 'src/common/multer/cloudinary.multer';
import { Request } from 'express';
import { BrandRepository } from 'src/DB/Repositories/brand.repo';

@Injectable()
export class BrandService {
  constructor(private readonly _brandRepo: BrandRepository) {}

  async create(
    createBrandDto: CreateBrandDto,
    req: Request,
    file: Express.Multer.File,
  ) {
    const brand = await this._brandRepo.findOne({
      filter: { name: createBrandDto.name },
    });
    if (brand) {
      throw new Error('Brand already exists');
    }
    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
      file.path,
      {
        folder: `E-Commerce/brands`,
      },
    );
    const newBrand = await this._brandRepo.create({
      ...createBrandDto,
      logo: {
        secure_url,
        public_id,
      },
      userId: req.user?._id,
    });
    return {
      message: 'Brand created successfully',
      brand: newBrand,
    };
  }

  async findAll() {
    return await this._brandRepo.find();
  }

  async findOne(id: string) {
    const brad = await this.brandExists(id);
    return brad;
  }

  async update(
    updateBrandDto: UpdateBrandDto,
    req: Request,
    file?: Express.Multer.File,
  ) {
    if (!req.user?.id) {
      throw new NotFoundException('user not found');
    }
    // 1️⃣ جلب البراند
    const brand = await this.brandExists(req.user?.id.toString());
    // 3️⃣ رفع الصورة الجديدة لو موجودة
    let secureUrl = '';
    let publicId = '';
    if (file) {
      // حذف الصورة القديمة من Cloudinary
      if (brand.logo?.public_id) {
        await cloudinaryConfig().uploader.destroy(brand.logo.public_id);
      }

      // رفع الصورة الجديدة
      const result = await cloudinaryConfig().uploader.upload(file.path, {
        folder: 'E-Commerce/brands',
      });

      secureUrl = result.secure_url;
      publicId = result.public_id;
    }

    // 4️⃣ تجهيز بيانات التحديث
    const updatedData: any = { name: updateBrandDto.name };
    updatedData.logo = file
      ? { secure_url: secureUrl, public_id: publicId }
      : brand.logo; // لو مفيش ملف جديد، خلي الصورة زي ما هي

    // 5️⃣ تحديث البراند في MongoDB
    const updatedBrand = await this._brandRepo.updateOne({
      filter: { _id: brand._id },
      update: { $set: updatedData, $inc: { __v: 1 } },
      options: { runValidators: true },
    });

    // 6️⃣ إعادة النتيجة
    return {
      message: 'Brand updated successfully',
      brand: updatedBrand,
    };
  }

  async remove(id: string) {
    const brand = await this.brandExists(id);
    if (brand.logo?.public_id) {
      await cloudinaryConfig().uploader.destroy(brand.logo.public_id);
    }
    await this._brandRepo.deleteById({ id: new Types.ObjectId(id) });
    return {
      message: 'Brand deleted successfully',
    };
  }

  async getMyBrand(req: Request) {
    const brand = await this._brandRepo.findOne({
      filter: { userId: req.user?._id },
    });
    return brand;
  }

  private async brandExists(id: string) {
    const brand = await this._brandRepo.findOne({
      filter: { userId: new Types.ObjectId(id) },
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }
}
