import { ChatMessage } from '../../domain/entities/chat-message.entity';
import { ChatUser } from '../../domain/entities/chat-user.entity';
import { ChatDTO } from '../dto/chat.dto';
import { ChatMessageMapper } from './chat-message.mapper';
import { ChatUserMapper } from './chat-user.mapper';

export class ChatMapper {
  static toDTO(entity: {
    id: number;
    name: string;
    members: ChatUser[];
    messages: ChatMessage[];
  }): ChatDTO {
    return {
      id: entity.id,
      name: entity.name,
      members: entity.members.map(ChatUserMapper.toDTO),
      messages: entity.messages
        .map(ChatMessageMapper.toDTO)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    };
  }
}
