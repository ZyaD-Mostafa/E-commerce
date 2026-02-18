import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('cats')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('getall')
  getAll(): string {
    return 'Get all cats';
  }
  @Get()
  home(): string {
    return 'Home';
  }
}
