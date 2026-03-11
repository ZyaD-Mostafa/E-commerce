export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
  VENDOR = 'VENDOR',
}

export enum GenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum ProviderEnum {
  GOOGLE = 'GOOGLE',
  SYSTEM = 'SYSTEM',
}

export enum EmailTypeEnum {
  VERIFY_EMAIL = 'Confrim Email',
  RESET_PASSWORD = 'Reset Password',
}

export const OtpEnum = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
  TWO_STEP_VERIFICATION: 'TWO_STEP_VERIFICATION',
};

export enum SignatureLeavels {
  USER = 'USER',
  ADMIN = 'ADMIN',
  VENDOR = 'VENDOR',
}
export enum TokenTypeEnum {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
}

export enum LogOutEnum {
  ONLY = 'ONLY',
  ALL = 'ALL',
}

export enum OrderStatusEnum {
  PLACED = 'placed',
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}
export enum paymentMethodEnum {
  CASH = 'CASH',
  CARD = 'CARD',
}
