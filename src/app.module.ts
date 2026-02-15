import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { PreAuthMiddleware } from './middleware/preAuth.middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';

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
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
    consumer.apply(PreAuthMiddleware).exclude('auth/signup','auth/login').forRoutes('auth');
  }
}
