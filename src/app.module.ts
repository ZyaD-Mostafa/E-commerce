import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { AuthModule } from './Modules/auth/auth.module';
import { UsersModule } from './Modules/User/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { PreAuthMiddleware } from './middleware/preAuth.middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { BrandModule } from './Modules/brand/brand.module';
import { CategoryModule } from './Modules/Admin/category/category.module';
import { TokenModule } from './Modules/token/token.module';
import { ProductModule } from './Modules/Vendor/product/product.module';
import { CartModule } from './Modules/User/cart/cart.module';
import { CouponModule } from './Modules/Admin/coupon/coupon.module';
import { OrderModule } from './Modules/User/order/order.module';
import { GatewayModule } from './gateway/gateway/gateway.module';
import { RepositoriesModule } from './DB/Repositories/repositories.module';
import { AdminModule } from './Modules/Admin/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('./config/dev.env'),
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI as string, {
      serverSelectionTimeoutMS: 5000,
      onConnectionCreate: (connection: Connection) => {
        connection.on('connected', () => {
          console.log('MongoDB connected Successfully');
        });
      },
    }),
    RepositoriesModule,
    AuthModule,
    UsersModule,
    ProductModule,
    BrandModule,
    CategoryModule,
    TokenModule,
    CartModule,
    CouponModule,
    OrderModule,
    GatewayModule,
    AdminModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
    consumer.apply(PreAuthMiddleware).forRoutes('user');
  }
}
