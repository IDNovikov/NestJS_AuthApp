// src/modules/chat/infrastructure/events/chat-ws-events.adapter.ts
import { Injectable } from '@nestjs/common';
import { ChatEventsPort } from '../../domain/ports/chat-events.port';
import { MessageSentEvent } from '../../domain/events/message-sent.event';
import { MessageEditedEvent } from '../../domain/events/message-edited.event';
import { ChatGateway } from '../ws/chat.gateway';
import { ChatMessageViewDto } from '../../application/dto/chat-message.dto';

@Injectable()
export class ChatWsEventsAdapter implements ChatEventsPort {
  constructor(private readonly gateway: ChatGateway) {}

  async publishMessageSent(event: MessageSentEvent): Promise<void> {
    const view = ChatMessageViewDto.fromEntity(event.message);

    // рассылаем всем в комнате
    this.gateway.emitToChat(event.message.chatId, 'message.new', view);
  }

  async publishMessageEdited(event: MessageEditedEvent): Promise<void> {
    const view = ChatMessageViewDto.fromEntity(event.message);

    // this.gateway.emitToChat(
    //   event.message.chatId,
    //   'message.edited',
    //   view,
    // );
  }
}
