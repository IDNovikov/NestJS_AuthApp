import { Module } from '@nestjs/common';
//import { ChatHttpController } from './infrastructure/controllers/chat.http.controller';
import { PrismaService } from '../core/prisma/prisma.service';
import { ChatDomainService } from './domain/services/chat.domain-service';
import { ChatFacade } from './application/chat.facade';
import { ChatRepository } from './domain/ports/chat.repository';
import { ChatPrismaRepository } from './infrastructure/persistance/chat.prisma.repository';

import { ChatController } from './infrastructure/controllers/chat.http.controller';
import { ChatEventsPort } from './domain/events/ws.port';

@Module({
  controllers: [ChatController],
  providers: [
    PrismaService,
    ChatDomainService,
    ChatFacade,
    {
      provide: ChatRepository,
      useClass: ChatPrismaRepository,
    },
    {
      provide: ChatEventsPort,
      useValue: {
        publishMessageSent: async () => {},
        publishMessageEdited: async () => {},
      },
    },
  ],
  exports: [ChatFacade, ChatDomainService, ChatEventsPort],
})
export class ChatModule {}
