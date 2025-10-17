import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

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

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀Server is running on http://localhost:3000/`);
}
bootstrap();
