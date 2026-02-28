import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { GenderEnum, OtpEnum, ProviderEnum } from 'src/common/enums/user.enums';
import { emailEvent } from 'src/common/utils/events/email.event';
import { hash } from 'src/common/utils/hashing/hash';
import { User } from './user.model';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Otp {
  constructor() {}

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  code: string;

  @Prop({
    type: Date,
    required: true,
  })
  expiresAt: Date;

  @Prop({
    type: String,
    enum: OtpEnum,
    required: true,
  })
  type: string;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: User.name,
  })
  createdBy: Types.ObjectId;
}

export const otpSchema = SchemaFactory.createForClass(Otp);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.pre(
  'save',
  async function (this: HOtpDocument & { wasNew: boolean; plainOtp: string }) {
    if (this.isModified('code')) {
      this.wasNew = this.isNew;
      this.plainOtp = this.code;
      this.code = await hash(this.code);
      await this.populate('createdBy');
    }
  },
);

otpSchema.post('save', async function (doc, next) {
  const that = this as HOtpDocument & { wasNew?: boolean; plainOtp?: string };
  if (that.wasNew && that.plainOtp) {
    emailEvent.emit('cofirm-email', {
      to: (that.createdBy as any).email,
      firstName: (that.createdBy as any).firstname,
      code: that.plainOtp,
    });
  }
});

export type HOtpDocument = HydratedDocument<Otp>;
export const OtpModel = MongooseModule.forFeature([
  { name: Otp.name, schema: otpSchema },
]);
