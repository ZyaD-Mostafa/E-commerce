import {
  BadRequestException,
  ForbiddenException,
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
import { disconnect } from 'process';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}
  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
    req: any,
  ) {
    const oldProd = await this.productModel.findOne({
      name: createProductDto.name,
    });
    if (oldProd) {
      throw new BadRequestException('Product already exists');
    }
    if (!createProductDto.category) {
      throw new BadRequestException('Category is required');
    }
    const category = await this.categoryModel.findById(
      createProductDto.category,
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const discount =
      createProductDto.originalPrice * (createProductDto.discount / 100);
    const product = await this.productModel.create({
      ...createProductDto,
      salePrice: createProductDto.originalPrice - discount,
      
      createdBy: req.user.id,
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
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    files: Express.Multer.File[],
    req: any,
  ) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
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

    const updatedProduct = await this.productModel.updateOne(
      { _id: id },
      {
        ...updateProductDto,
        $inc: { __v: 1 },
        image: newImage,
      },
      { runValidators: true },
    );

    return { message: 'Product updated successfully' };
  }

  async remove(id: string) {
    const prod = await this.productModel.findByIdAndDelete(id);
    if (!prod) {
      throw new NotFoundException('Product not found');
    }
    return {
      message: 'Product deleted successfully',
    };
  }

  async removeImage(public_id: string[], productId: string, req: any) {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
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
}
