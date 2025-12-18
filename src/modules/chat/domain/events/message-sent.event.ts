import { ChatMessage } from '@/modules/chat/domain/entities/chat-message.entity';

export class MessageSentEvent {
  constructor(public readonly message: ChatMessage) {}
}
