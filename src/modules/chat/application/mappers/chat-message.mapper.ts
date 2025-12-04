import { ChatMessage } from '../../domain/entities/chat-message.entity';
import { ChatMessageDTO } from '../dto/chat-message.dto';

export class ChatMessageMapper {
  static toDTO(entity: ChatMessage): ChatMessageDTO {
    const raw = entity.Message;
    return {
      id: raw.id,
      chatId: raw.chatId,
      authorId: raw.authorId,
      text: raw.text,
      createdAt: raw.createdAt.toISOString(),
      updatedAt: raw.updatedAt.toISOString(),
      isEdited: raw.isEdited,
    };
  }
}
