import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller("cats")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('gethello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('getall')
  getAll(): string {
    return 'Get all cats';
  }
  @Get()
  home (): string {
    return 'Home';
  }
}
