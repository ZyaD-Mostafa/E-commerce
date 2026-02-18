import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
async function bootstrap() {
  const port = process.env.PORT || 447;
  const app = await NestFactory.create(AppModule);

  app.use('/uploads', express.static('./src/uploads'));
  await app.listen(port, () => {
    console.log(`Server is running on port :`, Number(port));
  });
}
bootstrap();

// Guard , inerceptor , pipe , middleware , Controller , Service
// sorted --->Requset ---> middleware --> Guard --> inerceptor ---> Pipe -->Controller -->Service -->Response
