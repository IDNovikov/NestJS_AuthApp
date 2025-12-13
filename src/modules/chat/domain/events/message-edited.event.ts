import { ChatMessage } from '../entities/chat-message.entity';

export class MessageEditedEvent {
  constructor(public readonly message: ChatMessage) {}
}
