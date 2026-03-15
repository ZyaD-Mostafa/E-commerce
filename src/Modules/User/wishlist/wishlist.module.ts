import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { TokenModule } from 'src/Modules/token/token.module';

@Module({
  imports: [TokenModule],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
