import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { corsOption } from './common/utils/Cors/cors';
async function bootstrap() {
  const port = process.env.PORT || 447;
  const app = await NestFactory.create(AppModule);
  app.enableCors(corsOption());
  app.useGlobalInterceptors(new ResponseInterceptor());
  //app.use('/uploads', express.static('./src/uploads'));
  await app.listen(port, () => {
    console.log(`Server is running on port :`, Number(port));
  });
}
bootstrap();

// Guard , inerceptor , pipe , middleware , Controller , Service
// sorted --->Requset ---> middleware --> Guard --> inerceptor ---> Pipe -->Controller -->Service -->Response
