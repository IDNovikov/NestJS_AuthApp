import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [ConfigService],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
