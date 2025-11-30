import { ChatUser } from '../../domain/entities/chat-user.entity';
import { ChatUserDTO } from '../dto/chat-user.dto';

export class ChatUserMapper {
  static toDTO(entity: ChatUser): ChatUserDTO {
    const raw = entity.ChatUser;
    return {
      id: raw.id,
      userName: raw.userName,
      userImage: raw.userImage,
    };
  }
}
