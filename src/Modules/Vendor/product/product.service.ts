import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Types } from 'mongoose';
import { cloudinaryConfig } from 'src/common/multer/cloudinary.multer';
import { ProductRepository } from 'src/DB/Repositories/product.repo';
import { CategoryRepository } from 'src/DB/Repositories/category.repo';
import { Request } from 'express';

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
    req: Request,
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

    const product = await this._prodcutRepo.create({
      ...createProductDto,
      category: new Types.ObjectId(createProductDto.category), // Convert to ObjectId
      createdBy: new Types.ObjectId(req.user?.id), // Also convert user ID
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

  async findAll(search?: string) {
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    return await this._prodcutRepo.find({ filter });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    files: Express.Multer.File[],
    req: Request,
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
    if (!updateProductDto.variantId) {
      const updateData: any = {
        ...updateProductDto,
        image: newImage,
        $inc: { __v: 1 },
      };

      // ✅ حساب السعر للمنتج العادي
      if (
        updateProductDto.originalPrice !== undefined ||
        updateProductDto.discount !== undefined
      ) {
        const originalPrice =
          updateProductDto.originalPrice ?? product.originalPrice;

        const discount = updateProductDto.discount ?? product.discount ?? 0;

        updateData.salePrice =
          originalPrice && originalPrice > 0
            ? originalPrice - (originalPrice * discount) / 100
            : undefined;
      }

      const result = await this._prodcutRepo.updateOne({
        filter: { _id: id },
        update: updateData,
        options: { runValidators: true },
      });

      if (result.modifiedCount === 0) {
        throw new BadRequestException('fail to update');
      }
    } else {
      // Update variant
      if (!product?.variants || product?.variants.length === 0) {
        throw new NotFoundException('Product has no variants');
      }
      const varints = product?.variants?.find(
        (variant) => variant.id === updateProductDto.variantId,
      );
      if (!varints) {
        throw new NotFoundException('Variant not found');
      }
      if (updateProductDto.name) varints.name = updateProductDto.name;
      if (updateProductDto.originalPrice)
        varints.originalPrice = updateProductDto.originalPrice;
      if (updateProductDto.discount)
        varints.discount = updateProductDto.discount;
      if (updateProductDto.stock) varints.stock = updateProductDto.stock;

      await product.save();
    }

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
        'You are not authorized to update this product',
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
