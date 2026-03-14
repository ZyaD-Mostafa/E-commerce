import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UsePipes,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import {
  type CreateCategoryDto,
  createCategoryDtoSchema,
} from './dto/create-category.dto';
//import { type UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AccessRoleGuard } from 'src/common/guard/accessRole.guard';
import { UserRoleEnum } from 'src/common/enums/user.enums';
import { Roles } from 'src/common/decorator/role.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { MagicNumberInterceptor } from 'src/common/interceptor/magicNumber.Interceptor';
import {
  cloudFileUploadMulter,
  fileValidation,
} from 'src/common/multer/cloud.multer';
import { ZodPipe } from 'src/common/pipes/zod.pipe';
import {
  type AddbrandToCategoryDto,
  type UpdateCategoryDto,
  updateCategoryDtoSchema,
} from './dto/update-category.dto';
import { type Request } from 'express';

@UseGuards(AuthGuard, AccessRoleGuard)
@Roles([UserRoleEnum.ADMIN])
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', cloudFileUploadMulter('images')),
    MagicNumberInterceptor([...fileValidation.images]),
  )
  create(
    @Body(new ZodPipe(createCategoryDtoSchema))
    createCategoryDto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.categoryService.create(createCategoryDto, file, req);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @UseInterceptors(
    FileInterceptor('file', cloudFileUploadMulter('images')),
    MagicNumberInterceptor([...fileValidation.images]),
  )
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodPipe(updateCategoryDtoSchema))
    updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoryService.update(id, updateCategoryDto, file);
  }

  @Patch('toggle-brand-in-category/:id')
  toggleBrandInCategory(
    @Param('id') id: string,
    @Body() addbarnd: AddbrandToCategoryDto,
  ) {
    return this.categoryService.toggleBrandInCategory(id, addbarnd);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
