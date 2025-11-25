import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';

@Global()
@Module({
  imports: [PrismaModule, MailModule],
  providers: [],
  exports: [],
})
export class CoreModule {}
