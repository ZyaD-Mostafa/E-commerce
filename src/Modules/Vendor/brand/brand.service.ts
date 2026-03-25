import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Types } from 'mongoose';
import { cloudinaryConfig } from 'src/common/multer/cloudinary.multer';
import { Request } from 'express';
import { BrandRepository } from 'src/DB/Repositories/brand.repo';
import { Redis } from '@upstash/redis';

@Injectable()
export class BrandService {
  constructor(
    private readonly _brandRepo: BrandRepository,
    @Inject('UPSTASH_REDIS')
    private readonly redis: Redis,
  ) {}

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

  async findAll(search?: string) {
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    return await this._brandRepo.find({filter});
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
      brand.logo = {
        secure_url: secureUrl,
        public_id: publicId,
      };
    }
    if (updateBrandDto.name) {
      brand.name = updateBrandDto.name;
    }
    if (updateBrandDto.description) {
      brand.description = updateBrandDto.description;
    }
    await brand.save();

    return {
      message: 'Brand updated successfully',
      brand,
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
    const cachedBrand = await this.redis.get(`brand:${req.user?._id}`);
    if (cachedBrand) {
      return cachedBrand;
    }
    const brand = await this._brandRepo.findOne({
      filter: { userId: req.user?._id },
    });
    await this.redis.setex(`brand:${req.user?._id}`, 10, JSON.stringify(brand));
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
