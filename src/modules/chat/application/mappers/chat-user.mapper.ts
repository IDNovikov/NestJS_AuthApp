import { ChatUser } from '../../domain/entities/chat-user.entity';
import { ChatUserDTO } from '../dto/chat-user.dto';

export class ChatUserMapper {
  static toDTO(entity: ChatUser): ChatUserDTO {
    return {
      id: entity.id,
      userName: entity.userName,
      userImage: entity.userImage,
    };
  }
}
