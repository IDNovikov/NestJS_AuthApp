import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //SWAGGER CONFIG
  const config = new DocumentBuilder()
    .setTitle('Afishaved API')
    .setDescription('REST API docs')
    .setVersion('1.0')
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет поля, которых нет в DTO
      forbidNonWhitelisted: true, // бросает ошибку, если пришло «лишнее»
      transform: true, // автоматически преобразует типы
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log('SERVER is STSRTED');
}
bootstrap();
