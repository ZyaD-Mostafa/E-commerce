import {
  BadRequestException,
  ConflictException,
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
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
  ) {}
  async create(
    createCategoryDto: CreateCategoryDto,
    file: Express.Multer.File,
    req: any,
  ) {
    const category = await this.categoryModel.findOne({
      name: createCategoryDto.name,
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
      const foundBreand = await this.brandModel.find({
        _id: { $in: createCategoryDto.brands },
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

    const newCategory = await this.categoryModel.create({
      ...createCategoryDto,
      image: { secure_url, public_id },
      createdBy: req.user?._id,
    });

    return {
      message: 'Category created successfully',
      category: newCategory,
    };
  }

  async findAll() {
    return await this.categoryModel.find();
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    file: Express.Multer.File,
    req: any,
  ) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.brands && updateCategoryDto.brands.length > 0) {
      const foundBreand = await this.brandModel.find({
        _id: { $in: updateCategoryDto.brands },
      });
      if (foundBreand.length !== updateCategoryDto.brands?.length) {
        throw new BadRequestException('Missing Brands ids');
      }
    }
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
    }

    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updateCategoryDto,
          image,
        },
        $inc: { __v: 1 },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    return {
      message: 'Category updated successfully',
      category: updatedCategory,
    };
  }

  async remove(id: string) {
    const category = await this.categoryModel.findOneAndDelete({ _id: id });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    return {
      message: 'Category deleted successfully',
    };
  }
}
