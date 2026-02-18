import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { AuthModule } from './Modules/auth/auth.module';
import { UsersController } from './Modules/users/users.controller';
import { UsersService } from './Modules/users/users.service';
import { UsersModule } from './Modules/users/users.module';
import { ProductsModule } from './Modules/products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { PreAuthMiddleware } from './middleware/preAuth.middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { BrandModule } from './Modules/brand/brand.module';
import { BrandService } from './Modules/brand/brand.service';
import { BrandController } from './Modules/brand/brand.controller';
import { CategoryModule } from './Modules/category/category.module';
import { TokenService } from './Modules/token/token.service';
import { TokenModule } from './Modules/token/token.module';
import { AuthGuard } from './common/guard/auth.guard';

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
    AuthModule,
    UsersModule,
    ProductsModule,
    BrandModule,
    CategoryModule,
    TokenModule,
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
