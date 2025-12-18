import { ChatModule } from '@/modules/chat/chat.module';
import { JwtModule } from '@nestjs/jwt';
import { ChatWsEventsAdapter } from './adapters/ws.adapter';
import { Module } from '@nestjs/common';
import { WSChatGateway } from './ws.gateway';
import { WSRoot } from './rootWS.gateway';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatEventsPort } from '@/modules/chat/domain/events/ws.port';

@Module({
  imports: [
    ChatModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],

  providers: [
    WSRoot,
    WSChatGateway,
    ChatWsEventsAdapter,
    {
      provide: ChatEventsPort,
      useClass: ChatWsEventsAdapter,
    },
    ChatWsEventsAdapter,
  ],
  exports: [WSChatGateway],
})
export class WSChat {}
