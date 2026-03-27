import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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
import { type Request } from 'express';
import { brandCredentials } from 'src/common/guard/brandCredentials.guard';
import { SkipGuard } from 'src/common/decorator/skipBrandCredentail.decorator';
import { Public } from 'src/common/decorator/public.decorator';

@UseGuards(AuthGuard, AccessRoleGuard, brandCredentials)
@Roles([UserRoleEnum.VENDOR])
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  // @Post()
  // @UseInterceptors(
  //   FileInterceptor('file', cloudFileUploadMulter('images')),
  //   MagicNumberInterceptor([...fileValidation.images]),
  // )
  // create(
  //   @Body(new ValidationPipe()) createBrandDto: CreateBrandDto,
  //   @UploadedFile() file: Express.Multer.File,
  //   @Req() req: Request,
  // ) {
  //   return this.brandService.create(createBrandDto, req, file);
  // }

  @SkipGuard()
  @Get('my-brand')
  getMyBrand(@Req() req: Request) {
    return this.brandService.getMyBrand(req);
  }
  @Public()
  @Get()
  findAll(@Query('search') search?: string) {
    return this.brandService.findAll(search);
  }

  @Roles([UserRoleEnum.ADMIN])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }

  @Patch()
  @UseInterceptors(
    FileInterceptor('file', cloudFileUploadMulter('images')),
    MagicNumberInterceptor([...fileValidation.images]),
  )
  update(
    @Body() updateBrandDto: UpdateBrandDto,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.brandService.update(updateBrandDto, req, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandService.remove(id);
  }
}
