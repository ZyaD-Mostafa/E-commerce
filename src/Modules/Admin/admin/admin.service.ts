import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAdminVendorDto } from './dto/create-admin.dto';
import { Request } from 'express';
import { UserRoleEnum } from 'src/common/enums/user.enums';
import { UserRepository } from 'src/DB/Repositories/user.repo';
import { BrandRepository } from 'src/DB/Repositories/brand.repo';

@Injectable()
export class AdminService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _brandRepo: BrandRepository,
  ) {}

  async createVendorOrAdmin(
    createAdminDto: CreateAdminVendorDto,
    req: Request,
  ) {
    // create admin
    if (createAdminDto.role === UserRoleEnum.ADMIN) {
      const admin = await this._userRepository.create({
        ...createAdminDto,
        role: UserRoleEnum.ADMIN,
      });
      if (!admin) {
        throw new BadRequestException('Failed to create admin');
      }
      return {
        meassge: 'Admin account created successfully',
        admin,
      };
    }
    // crere vendor
    if (createAdminDto.role === UserRoleEnum.VENDOR) {
      const vendor = await this._userRepository.create({
        ...createAdminDto,
        role: UserRoleEnum.VENDOR,
      });
      if (!vendor) {
        throw new BadRequestException('Failed to create vendor');
      }
      const brand = await this._brandRepo.create({
        userId: vendor._id,
        name: createAdminDto.username,
      });
      if (!brand) {
        throw new BadRequestException('Failed to create brand');
      }
      return {
        meassge: 'Vendor account created successfully',
        vendor,
        brand,
      };
    }
    return 'This action adds a new admin';
  }

  findAll() {
    return `This action returns all admin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  // update(id: number, updateAdminDto: UpdateAdminDto) {
  //   return `This action updates a #${id} admin`;
  // }

  
}
