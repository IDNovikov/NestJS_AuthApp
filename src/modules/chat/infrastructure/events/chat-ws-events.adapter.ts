// src/modules/chat/infrastructure/events/chat-ws-events.adapter.ts
import { Injectable } from '@nestjs/common';
import { ChatEventsPort } from '../../domain/ports/chat-events.port';
import { MessageSentEvent } from '../../domain/events/message-sent.event';
import { MessageEditedEvent } from '../../domain/events/message-edited.event';
import { ChatGateway } from '../ws/chat.gateway';
import { ChatMessageDTO } from '../../application/dto/chat-message.dto';
import { ChatMessageMapper } from '../../application/mappers/chat-message.mapper';

@Injectable()
export class ChatWsEventsAdapter implements ChatEventsPort {
  constructor(private readonly gateway: ChatGateway) {}

  async publishMessageSent(event: MessageSentEvent): Promise<void> {
    const view = ChatMessageMapper.toDTO(event.message);
    // рассылаем всем в комнате
    this.gateway.emitToChat(event.message.Message.chatId, 'message.new', view);
  }

  async publishMessageEdited(event: MessageEditedEvent): Promise<void> {
    const view = ChatMessageMapper.toDTO(event.message);

    this.gateway.emitToChat(
      event.message.Message.chatId,
      'message.edited',
      view,
    );
  }
}
