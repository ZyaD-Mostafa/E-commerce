import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.PORT || 447;
  const app = await NestFactory.create(AppModule);
  await app.listen(port , ()=>{
    console.log(`Server is running on port :` , Number(port));
  });
}
bootstrap();



// Guard , inerceptor , pipe , middleware , Controller , Service 
// sorted --->Requset ---> middleware --> Guard --> inerceptor ---> Pipe -->Controller -->Service -->Response