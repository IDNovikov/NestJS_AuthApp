import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptors } from './common/interceptors/loggining.intrceptor';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  //SWAGGER CONFIG
  const config = new DocumentBuilder()
    .setTitle('Afishaved API')
    .setDescription('REST API docs')
    .setVersion('1.0')
    //.addBearerAuth()//Для авторизации
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, doc);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет поля, которых нет в DTO
      forbidNonWhitelisted: true, // бросает ошибку, если пришло «лишнее»
      transform: true, // автоматически преобразует типы
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptors());
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀Server is running on http://localhost:3000/`);
  console.log('REST:    http://localhost:3000/users');
  console.log('Swagger: http://localhost:3000/api/docs');
  console.log('GraphQL: http://localhost:3000/graphql');
}
bootstrap();
