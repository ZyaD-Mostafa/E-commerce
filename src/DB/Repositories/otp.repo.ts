import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from './base.repo';
import { Model } from 'mongoose';
import { HOtpDocument, Otp } from '../models/otp.model';

export class OtpRepository extends BaseRepository<HOtpDocument> {
  constructor(
    @InjectModel(Otp.name)
    private readonly otpModel: Model<HOtpDocument>,
  ) {
    super(otpModel);
  }
}
