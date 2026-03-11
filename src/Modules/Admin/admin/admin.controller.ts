import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import {  type CreateAdminVendorDto } from './dto/create-admin.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AccessRoleGuard } from 'src/common/guard/accessRole.guard';
import { UserRoleEnum } from 'src/common/enums/user.enums';
import { Roles } from 'src/common/decorator/role.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFileUploadMulter, fileValidation } from 'src/common/multer/cloud.multer';
import { MagicNumberInterceptor } from 'src/common/interceptor/magicNumber.Interceptor';
@UseGuards(AuthGuard, AccessRoleGuard)
@Roles([UserRoleEnum.ADMIN])
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}


  // @UseInterceptors(
  //   FileInterceptor('file', cloudFileUploadMulter('images')),
  //   MagicNumberInterceptor([...fileValidation.images]),
  // )
  @Post('create')
  create(@Body() createAdminVendor: CreateAdminVendorDto, @Req() req: any, ) {
    return this.adminService.createVendorOrAdmin(createAdminVendor, req);
  }

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
  //   return this.adminService.update(+id, updateAdminDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
