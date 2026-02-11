import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { GenderEnum, ProviderEnum } from 'src/common/enums/user.enums';
import { hash } from 'src/common/utils/hashing/hash';
import { HOtpDocument } from './otp.model';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class User {
  constructor() {}

  @Prop({
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    trim: true,
  })
  firstname: string;
    @Prop({
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    trim: true,
  })
  lastname: string;

  @Virtual({
    get: function () {
      return this.firstname + ' ' + this.lastname;
    },
    set: function (value: string) {
      const [firstname, lastname] = value.split(' ') || [];
      this.set({ firstname, lastname });
    },
  })
  username: string;
  @Prop({
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  })
  email: string;
  @Prop({
    type: String,
    required: function () {
      return this.provider === 'SYSTEM' ? true : false;
    },
    trim: true,
  })
  password: string;
  @Prop({
    type: Date,
  })
  confirmEmail: Date;
  @Prop({
    type: Date,
  })
  confrimEmailOTP: Date;
  @Prop({
    type: String,
    required: true,
    enum: {
      values: Object.values(GenderEnum),
      message: '{VALUE} gender must be MALE or FEMALE',
    },
    default: GenderEnum.MALE,
  })
  gender: string;
  @Prop({
    type: String,
    required: true,
    enum: {
      values: Object.values(ProviderEnum),
      message: '{VALUE} provider must be SYSTEM or GOOGLE',
    },
    default: ProviderEnum.SYSTEM,
  })
  provider: string;

  @Virtual()
  otp: HOtpDocument[];
}

export const userSchema = SchemaFactory.createForClass(User);

userSchema.virtual('otp', {
  ref: 'Otp',
  localField: '_id',
  foreignField: 'createdBy',
});
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hash(this.password);
  }
});

export type HUserDocument = HydratedDocument<User>;
export const UserModel = MongooseModule.forFeature([
  { name: User.name, schema: userSchema },
]);
