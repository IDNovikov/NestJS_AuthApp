import { ChatUserDTO } from './chat-user.dto';

export class EditMembersDTO {
  chatId: number;
  members: ChatUserDTO[];
}
