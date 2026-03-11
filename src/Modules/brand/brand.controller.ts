import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ValidationPipe,
  UploadedFile,
  UseGuards,
  Req,
  UploadedFiles,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Types } from 'mongoose';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AccessRoleGuard } from 'src/common/guard/accessRole.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { UserRoleEnum } from 'src/common/enums/user.enums';
import {
  cloudFileUploadMulter,
  fileValidation,
} from 'src/common/multer/cloud.multer';
import { MagicNumberInterceptor } from 'src/common/interceptor/magicNumber.Interceptor';
import {type Request } from 'express';

@UseGuards(AuthGuard, AccessRoleGuard)
@Roles([UserRoleEnum.ADMIN])
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', cloudFileUploadMulter('images')),
    MagicNumberInterceptor([...fileValidation.images]),
  )
  create(
    @Body(new ValidationPipe()) createBrandDto: CreateBrandDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.brandService.create(createBrandDto, req, file);
  }

  @Get()
  findAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', cloudFileUploadMulter('images')),
    MagicNumberInterceptor([...fileValidation.images]),
  )
  update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const _id = new Types.ObjectId(id);
    return this.brandService.update(_id, updateBrandDto, req, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandService.remove(id);
  }
}
