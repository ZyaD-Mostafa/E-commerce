import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
//import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from 'src/DB/models/category.model';
import { Brand } from 'src/DB/models/brand.model';
import { cloudinaryConfig } from 'src/common/multer/cloudinary.multer';
import {
  AddbrandToCategoryDto,
  UpdateCategoryDto,
} from './dto/update-category.dto';
import { CategoryRepository } from 'src/DB/Repositories/category.repo';
import { BrandRepository } from 'src/DB/Repositories/brand.repo';
import { Request } from 'express';
import { Redis } from '@upstash/redis';

@Injectable()
export class CategoryService {
  constructor(
    private readonly _categoryRepository: CategoryRepository,
    private readonly _brandRepository: BrandRepository,
    @Inject('UPSTASH_REDIS')
    private readonly redis: Redis,
  ) {}
  async create(
    createCategoryDto: CreateCategoryDto,
    file: Express.Multer.File,
    req: Request,
  ) {
    const category = await this._categoryRepository.findOne({
      filter: { name: createCategoryDto.name },
    });
    if (category) {
      throw new ConflictException('Category already exists');
    }
    // i already validate the brand ids in zod schema
    // if (createCategoryDto.brand && createCategoryDto.brand.length > 0) {
    //   const invalid = createCategoryDto.brand.find(
    //     (id) => !Types.ObjectId.isValid(id),
    //   );
    //   if (invalid) {
    //     throw new BadRequestException(`Invalid brand id Format ${invalid}`);
    //   }
    // }

    if (createCategoryDto.brands && createCategoryDto.brands.length > 0) {
      const foundBreand = await this._brandRepository.find({
        filter: { _id: { $in: createCategoryDto.brands } },
      });
      if (foundBreand.length !== createCategoryDto.brands?.length) {
        throw new BadRequestException('Missing Brands ids');
      }
    }

    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
      file.path,
      {
        folder: 'E-Commerce/categories',
      },
    );

    // Replace lines 63-69 in category.service.ts with:
    const newCategory = await this._categoryRepository.create({
      ...createCategoryDto,
      brands: createCategoryDto.brands?.map((id) => new Types.ObjectId(id)),
      image: { secure_url, public_id },
      createdBy: req.user?._id,
    });

    return {
      message: 'Category created successfully',
      category: newCategory,
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

    return await this._categoryRepository.find({ filter });
  }

  async findOne(id: string) {
    const cached = `category:${id}`; //category:69b5cffa959b99d8e6b25e6d
    const get = await this.redis.get(cached);
    if (get) {
      return get;
    }
    const category = await this.categoryExist(id);
    await this.redis.setex(cached, 10, JSON.stringify(category));
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    file: Express.Multer.File,
  ) {
    const category = await this.categoryExist(id);

    // if (updateCategoryDto.brands && updateCategoryDto.brands.length > 0) {
    //   const foundBreand = await this._brandRepository.find({
    //     filter: { _id: { $in: updateCategoryDto.brands } },
    //   });
    //   if (foundBreand.length !== updateCategoryDto.brands?.length) {
    //     throw new BadRequestException('Missing Brands ids');
    //   }
    // }
    let image = category.image;
    if (file) {
      const { secure_url, public_id } =
        await cloudinaryConfig().uploader.upload(file.path, {
          folder: 'E-Commerce/categories',
        });
      image = { secure_url, public_id };
      if (category.image?.public_id) {
        await cloudinaryConfig().uploader.destroy(category.image.public_id);
      }
      category.image = image;
    }

    if (updateCategoryDto.name) category.name = updateCategoryDto.name;
    if (updateCategoryDto.description)
      category.description = updateCategoryDto.description;
    await category.save();

    return {
      message: 'Category updated successfully',
      category,
    };
  }

  async toggleBrandInCategory(
    categoryId: string,
    addbrandToCategoryDto: AddbrandToCategoryDto,
  ) {
    const brandId = new Types.ObjectId(addbrandToCategoryDto.brandId);

    const category = await this.categoryExist(categoryId);

    const brand = await this._brandRepository.findById({ id: brandId });
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    const isExist = category.brands.some(
      (b) => b.toString() === brandId.toString(),
    );

    const update = isExist
      ? { $pull: { brands: brandId } }
      : { $addToSet: { brands: brandId } };

    await this._categoryRepository.findByIdAndUpdate({
      id: categoryId,
      update,
      options: { runValidators: true },
    });

    return {
      message: isExist
        ? 'Brand removed from category successfully'
        : 'Brand added to category successfully',
    };
  }

  async remove(id: string) {
    const category = await this._categoryRepository.findOneAndDelete({
      _id: id,
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    return {
      message: 'Category deleted successfully',
    };
  }

  private async categoryExist(id: string) {
    const category = await this._categoryRepository.findById({
      id: new Types.ObjectId(id),
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
}
