import {
  All,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Req,
} from '@nestjs/common';
import { AppService } from './app.service';
import { UserRepository } from './DB/Repositories/user.repo';

@Controller('')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly _userRepo: UserRepository,
  ) {}
  @Delete('del-acc/:email')
  async deleteAccount(@Param('email') email: string) {
    const result = await this._userRepo.deleteOne({ email });

    if (result.deletedCount === 0) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }
  @All('/*dummy')
  dummy(@Req() req: Request) {
    return {
      message: `url ${req.url} not found`,
    };
  }
}
