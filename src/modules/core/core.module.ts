import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters/globalException.filter';

@Global()
@Module({
  imports: [PrismaModule, MailModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [],
})
export class CoreModule {}
