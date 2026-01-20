import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { LoggingInterceptors } from './common/interceptors/loggining.intrceptor';
import cookieParser from 'cookie-parser';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  //SWAGGER CONFIG
  const config = new DocumentBuilder()
    .setTitle('Afishaved API')
    .setDescription('REST API docs')
    .setVersion('1.0')
    .addCookieAuth('refresh_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refresh_token',
      description: 'JWT Refresh Token stored in cookie',
    })
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token (example: Bearer eyJhbGciOi...)',
        in: 'header',
      },
      'access_token',
    )
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, doc, {
    swaggerOptions: { withCredentials: true },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        console.log(JSON.stringify(errors, null, 2));
        return new BadRequestException(errors);
      },
    }),
  );
  app.use(cookieParser());
  app.useGlobalInterceptors(new LoggingInterceptors());
  const port = process.env.PORT ?? 3000;

  app.enableCors({ origin: '*', credentials: true });
  await app.listen(port);
  console.log(`🚀 Server is running on http://localhost:${port}/`);
  console.log(`REST:    http://localhost:${port}/api`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
  console.log(`GraphQL: http://localhost:${port}/graphql`);
}
bootstrap();
