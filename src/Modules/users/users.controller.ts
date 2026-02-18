import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { LoggingInterceptor } from 'src/common/interceptor/logger.interceptor';
import { ResponseInterceptor } from 'src/common/interceptor/response.interceptor';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { UsersService } from './users.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  type LogOutDto,
  logOutSchema,
  type UpdateProfileDto,
  updateProfileSchema,
} from './user.dto';
import { ZodPipe } from 'src/common/pipes/zod.pipe';
import {
  cloudFileUploadMulter,
  fileValidation,
} from 'src/common/multer/cloud.multer';
import { MagicNumberInterceptor } from 'src/common/interceptor/magicNumber.Interceptor';

@UseInterceptors(LoggingInterceptor, ResponseInterceptor)
@UseGuards(AuthGuard)
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/profile')
  //@HttpCode(200)
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  profile(@Req() req: Request) {
    return this.usersService.getProfile(req);
  }

  @Patch('/profileImage')
  @HttpCode(201)
  @UseInterceptors(
    FileInterceptor('file', cloudFileUploadMulter('images')),
    MagicNumberInterceptor([...fileValidation.images]),
  )
  async profileImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return await this.usersService.profileImage(file, req);
  }
  @Patch('/upload-files')
  @UseInterceptors(
    FilesInterceptor('files', 5, cloudFileUploadMulter('images')),
    MagicNumberInterceptor([...fileValidation.images]),
  )
  async uploadFiles(
    @UploadedFiles() files: Array<Express.Multer.File[]>,
    @Req() req: Request,
  ) {
    return await this.usersService.uploadFiles(files, req);
  }

  @Post('logout')
  @HttpCode(201)
  @UsePipes(new ZodPipe(logOutSchema))
  logout(@Body() body: LogOutDto, @Req() req: Request) {
    return this.usersService.logout(body, req);
  }

  @Patch('update-profile')
  @UsePipes(new ZodPipe(updateProfileSchema))
  updateProfile(@Body() body: UpdateProfileDto, @Req() req: Request) {
    return this.usersService.updateProfile(body, req);
  }
}
