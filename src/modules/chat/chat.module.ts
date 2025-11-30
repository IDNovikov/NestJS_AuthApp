import { Module } from '@nestjs/common';
import { ChatHttpController } from './infrastructure/controllers/chat.http.controller';
import { PrismaService } from '../core/prisma/prisma.service';
import { ChatDomainService } from './domain/services/chat.domain-service';
import { ChatFacade } from './application/chat.facade';

@Module({
  imports: [],
  controllers: [ChatHttpController],
  providers: [ChatDomainService, PrismaService, ChatFacade],
  exports: [ChatFacade, ChatDomainService],
})
//Заргеать в maim.module
export class ChatModule {}
