import { ChatRoom } from '../../domain/entities/chat-room.entity';
import { ChatRoomDTO } from '../dto/chat-room.dto';
import { ChatUserMapper } from './chat-user.mapper';

export class ChatRoomMapper {
  static toDTO(entity: ChatRoom): ChatRoomDTO {
    const { id, name, members } = entity;
    return {
      id: id,
      name: name,
      members: members.map(ChatUserMapper.toDTO),
    };
  }
}
