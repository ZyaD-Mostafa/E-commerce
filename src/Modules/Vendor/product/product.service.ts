import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from 'src/DB/models/category.model';
import { cloudinaryConfig } from 'src/common/multer/cloudinary.multer';
import { Product } from 'src/DB/models/product.model';
import { ProductRepository } from 'src/DB/Repositories/product.repo';
import { CategoryRepository } from 'src/DB/Repositories/category.repo';

@Injectable()
export class ProductService {
  constructor(
    private readonly _prodcutRepo: ProductRepository,
    private readonly _categoryRepo: CategoryRepository,
  ) {}
  // دالة اختبار الاتصال

  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
    req: any,
  ) {
    const oldProd = await this._prodcutRepo.findOne({
      filter: { name: createProductDto.name },
    });
    if (oldProd) {
      throw new BadRequestException('Product already exists');
    }
    if (!createProductDto.category) {
      throw new BadRequestException('Category is required');
    }
    const category = await this._categoryRepo.findById({
      id: createProductDto.category,
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const discount =
      createProductDto.originalPrice * (createProductDto.discount / 100);
    // Replace lines 51-55 in product.service.ts
    const product = await this._prodcutRepo.create({
      ...createProductDto,
      category: new Types.ObjectId(createProductDto.category), // Convert to ObjectId
      salePrice: createProductDto.originalPrice - discount,
      createdBy: new Types.ObjectId(req.user.id), // Also convert user ID
    });

    let image: { secure_url: string; public_id: string }[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const { secure_url, public_id } =
          await cloudinaryConfig().uploader.upload(file.path, {
            folder: `E-Commerce/products/${product._id}`,
          });
        image.push({ secure_url, public_id });
        product.image = image;
        await product.save();
      }
    } else {
      console.log('no file uploaded');
    }

    return product;
  }

  async findOne(id: string) {
    const product = await this.productExist(id);
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    files: Express.Multer.File[],
    req: any,
  ) {
    const product = await this.productExist(id);
    if (req.user?._id.toString() !== product.createdBy.toString()) {
      throw new ForbiddenException(
        'You are not authorized to update this product',
      );
    }
    let newImage: { secure_url?: string; public_id?: string }[] =
      product.image || [];

    if (files) {
      for (const image of files) {
        const { secure_url, public_id } =
          await cloudinaryConfig().uploader.upload(image.path, {
            folder: `E-Commerce/products/${product._id}`,
          });
        newImage.push({ secure_url, public_id });
      }
    }

    product.image = newImage;

    const updatedProduct = await this._prodcutRepo.updateOne({
      filter: { _id: id },
      update: {
        ...updateProductDto,
        $inc: { __v: 1 },
        image: newImage,
      },
      options: { runValidators: true },
    });

    return { message: 'Product updated successfully' };
  }

  async remove(id: string) {
    const prod = await this._prodcutRepo.findByIdAndDelete({ id });
    if (!prod) {
      throw new NotFoundException('Product not found');
    }
    return {
      message: 'Product deleted successfully',
    };
  }

  async removeImage(public_id: string[], productId: string, req: any) {
    const product = await this.productExist(productId);

    if (product.createdBy.toString() !== req.user._id.toString()) {
      throw new ForbiddenException(
        'You are not authorized to delete this product',
      );
    }
    if (!public_id || public_id.length === 0) {
      throw new BadRequestException('No images provided');
    }
    if (public_id.length > 0) {
      for (const id of public_id) {
        await cloudinaryConfig().uploader.destroy(id);
      }
    }

    product.image = product.image.filter(
      (img) => img.public_id && !public_id.includes(img.public_id),
    );
    await product.save();
    return {
      message: 'Image deleted successfully',
    };
  }

  private async productExist(id: string) {
    const product = await this._prodcutRepo.findById({ id });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
}
