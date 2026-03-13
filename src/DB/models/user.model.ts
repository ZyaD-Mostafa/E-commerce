import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  GenderEnum,
  ProviderEnum,
  UserRoleEnum,
} from 'src/common/enums/user.enums';
import { hash } from 'src/common/utils/hashing/hash';
import { HOtpDocument } from './otp.model';
import { object, string } from 'zod';
import slugify from 'slugify';

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
    minlength: 2,
    maxlength: 50,
    trim: true,
  })
  firstname: string;
  @Prop({
    type: String,
    minlength: 2,
    maxlength: 50,
    trim: true,
  })
  lastname: string;

  @Virtual({
    get: function () {
      if (!this.lastname) return this.firstname;
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
      return this.provider === ProviderEnum.SYSTEM ? true : false;
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
    required: function () {
      return this.role === UserRoleEnum.USER ? true : false;
    },
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
  @Prop({
    type: String,
    required: true,
    enum: {
      values: Object.values(UserRoleEnum),
      message: '{VALUE} role must be USER or ADMIN or VENDOR',
    },
    default: UserRoleEnum.USER,
  })
  role: UserRoleEnum;

  @Prop({
    type: Date,
  })
  changeCredintaialstime: Date;
  @Prop({
    type: String,
  })
  slug: string;

  @Prop({
    type: String,
  })
  phone: string;

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

userSchema.pre('save', async function (next) {
  if (this.isModified('firstname') || this.isModified('lastname')) {
    if (this.lastname)
      this.slug = slugify(this.firstname + ' ' + this.lastname, {
        lower: true,
      });
    else {
      this.slug = slugify(this.firstname, { lower: true });
    }
  }
});

export type HUserDocument = HydratedDocument<User>;
export const UserModel = MongooseModule.forFeature([
  { name: User.name, schema: userSchema },
]);
