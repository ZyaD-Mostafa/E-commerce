import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Brand } from 'src/DB/models/brand.model';
import { cloudinaryConfig } from 'src/common/multer/cloudinary.multer';

@Injectable()
export class BrandService {
  constructor(@InjectModel(Brand.name) private brandModel: Model<Brand>) {}

  async create(
    createBrandDto: CreateBrandDto,
    req: any,
    file: Express.Multer.File,
  ) {
    const brand = await this.brandModel.findOne({ name: createBrandDto.name });
    if (brand) {
      throw new Error('Brand already exists');
    }
    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
      file.path,
      {
        folder: `E-Commerce/brands`,
      },
    );
    const newBrand = await this.brandModel.create({
      ...createBrandDto,
      image: {
        secure_url,
        public_id,
      },
      createdBy: req.user._id,
    });
    return {
      message: 'Brand created successfully',
      brand: newBrand,
    };
  }

  async findAll() {
    return await this.brandModel.find();
  }

  async findOne(id: string) {
    const brand = await this.brandModel.findById(new Types.ObjectId(id));
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async update(
    _id: Types.ObjectId,
    updateBrandDto: UpdateBrandDto,
    req: any,
    file?: Express.Multer.File,
  ) {
    // 1️⃣ جلب البراند
    const brand = await this.brandModel.findById(_id);
    if (!brand) throw new NotFoundException('Brand not found');
    if (brand.createdBy.toString() !== req.user._id.toString()) {
      throw new ForbiddenException(
        'You are not authorized to update this brand',
      );
    }

    // 3️⃣ رفع الصورة الجديدة لو موجودة
    let secureUrl = '';
    let publicId = '';
    if (file) {
      // حذف الصورة القديمة من Cloudinary
      if (brand.image?.public_id) {
        await cloudinaryConfig().uploader.destroy(brand.image.public_id);
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
    updatedData.image = file
      ? { secure_url: secureUrl, public_id: publicId }
      : brand.image; // لو مفيش ملف جديد، خلي الصورة زي ما هي

    // 5️⃣ تحديث البراند في MongoDB
    const updatedBrand = await this.brandModel.findByIdAndUpdate(
      _id,
      updatedData,
      { new: true, runValidators: true },
    );

    // 6️⃣ إعادة النتيجة
    return {
      message: 'Brand updated successfully',
      brand: updatedBrand,
    };
  }

  async remove(id: string) {
    const brand = await this.brandModel.findById(id);
    if (!brand) throw new NotFoundException('Brand not found');
    if (brand.image?.public_id) {
      await cloudinaryConfig().uploader.destroy(brand.image.public_id);
    }
    await this.brandModel.findByIdAndDelete(id);
    return {
      message: 'Brand deleted successfully',
    };
  }
}
