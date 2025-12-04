import { ChatUserDTO } from './chat-user.dto';

export class CreateChatDTO {
  name: string | null;
  members: ChatUserDTO[];
}
