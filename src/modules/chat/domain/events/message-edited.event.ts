import { ChatMessage } from '@/modules/chat/domain/entities/chat-message.entity';

export class MessageEditedEvent {
  constructor(public readonly message: ChatMessage) {}
}
