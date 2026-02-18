import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { UserRoleEnum } from './common/enums/user.enums';
import { getSignatureLevel } from './common/token/token';

@Injectable()
export class AppService {
 

  
}
