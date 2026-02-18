// src/Modules/brand/brand.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, brandSchema } from 'src/DB/models/brand.model';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Brand.name, schema: brandSchema },
    ]),
  ],
  controllers: [BrandController],
  providers: [BrandService],
  //exports: [BrandService], // لو هتحتاجه بره
})
export class BrandModule {}
