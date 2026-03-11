import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  UploadedFiles,
  UseInterceptors,
  Req,
  UseGuards,
  UploadedFile,
  Inject,
} from '@nestjs/common';
import { ProductService } from './product.service';
import {
  createProductDtoSchema,
  type CreateProductDto,
} from './dto/create-product.dto';
import {
  type UpdateProductDto,
  UpdateProductSchemaDto,
} from './dto/update-product.dto';
import { ZodPipe } from 'src/common/pipes/zod.pipe';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { cloudFileUploadMulter } from 'src/common/multer/cloud.multer';
import { UserRoleEnum } from 'src/common/enums/user.enums';
import { Roles } from 'src/common/decorator/role.decorator';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AccessRoleGuard } from 'src/common/guard/accessRole.guard';
import { Types } from 'mongoose';
import { type Redis } from '@upstash/redis';

@UseGuards(AuthGuard, AccessRoleGuard)
@Roles([UserRoleEnum.ADMIN])
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
   // @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  // @Get('test-redis')
  // async testRedis() {
  //   const cachedUser = await this.redisClient.get('user');

  //   if (cachedUser) {
  //     console.log(typeof cachedUser);
      
  //     return cachedUser 
  //   }

  //   const user = {
  //     message: 'hi done at ' + new Date().toISOString(),
  //     username: 'zyad',
  //   };

  //   await this.redisClient.set('user', JSON.stringify(user), { ex: 60 });

  //   return user;
  // }

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 5, cloudFileUploadMulter('images')),
  )
  create(
    @Body(new ZodPipe(createProductDtoSchema))
    createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    console.log('FILES IN CONTROLLER 👉', files);

    return this.productService.create(createProductDto, files, req);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('files', 5, cloudFileUploadMulter('images')),
  )
  update(
    @Param('id') id: string,
    @Body(new ZodPipe(UpdateProductSchemaDto))
    updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    return this.productService.update(id, updateProductDto, files, req);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
  @Delete('deleteImage/:productId')
  removeImage(
    @Body('public_id') public_id: string[],
    @Req() req: Request,
    @Param('productId') productId: string,
  ) {
    return this.productService.removeImage(public_id, productId, req);
  }
}
