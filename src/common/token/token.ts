import { UserRoleEnum } from '../enums/user.enums';

// getSignatureLevel
export const getSignatureLevel = (role: UserRoleEnum = UserRoleEnum.USER) => {
  let signature = '';
  switch (role) {
    case UserRoleEnum.ADMIN:
      signature = process.env.ADMIN_JWT_SECRET as string;
      break;
    case UserRoleEnum.USER:
      signature = process.env.USER_JWT_SECRET as string;
      break;
    default:
      break;
  }
  return signature;
};
