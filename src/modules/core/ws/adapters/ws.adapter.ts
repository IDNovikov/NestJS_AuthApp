import { MessageSentEvent } from '@/modules/chat/domain/events/message-sent.event';
import { Injectable } from '@nestjs/common';
import { WSChatGateway } from '../ws.gateway';
import { MessageEditedEvent } from '@/modules/chat/domain/events/message-edited.event';
import { ChatMessageMapper } from '@/modules/chat/application/mappers/chat-message.mapper';
import { ChatEventsPort } from '@/modules/chat/domain/events/ws.port';

@Injectable()
export class ChatWsEventsAdapter implements ChatEventsPort {
  constructor(private readonly gateway: WSChatGateway) {}

  async publishMessageSent(event: MessageSentEvent): Promise<void> {
    const view = ChatMessageMapper.toDTO(event.message);
    console.log(event);
    this.gateway.emitToChat(event.message.Message.chatId, 'message.new', view);
  }

  async publishMessageEdited(event: MessageEditedEvent): Promise<void> {
    const view = ChatMessageMapper.toDTO(event.message);
    console.log(event);
    this.gateway.emitToChat(
      event.message.Message.chatId,
      'message.edited',
      view,
    );
  }
}
