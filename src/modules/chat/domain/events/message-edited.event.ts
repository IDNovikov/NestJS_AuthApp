import { ChatMessage } from '../entities/chat-message.entity';

export class MessageEditedEvent {
  constructor(public readonly message: ChatMessage) {}
}

//эти классы будут переданы в ChatEventsPort → дальше уже WebSocket/событийная шина.
