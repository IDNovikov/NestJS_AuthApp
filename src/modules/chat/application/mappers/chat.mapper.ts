import { Chat } from '../../domain/entities/chat.entity';
import { ChatDTO } from '../dto/chat.dto';
import { ChatMessageMapper } from './chat-message.mapper';
import { ChatUserMapper } from './chat-user.mapper';

export class ChatMapper {
  static toDTO(entity: Chat): ChatDTO {
    const raw = entity.Chat;
    return {
      id: raw.id,
      name: raw.name,
      members: raw.members.map(ChatUserMapper.toDTO),
      messages: raw.messages
        .map(ChatMessageMapper.toDTO)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    };
  }
}
