import { ChatMessageDTO } from './chat-message.dto';
import { ChatUserDTO } from './chat-user.dto';

export type ChatDTO = {
  id: number;
  name: string | null;
  members: ChatUserDTO[];
  messages: ChatMessageDTO[];
};
