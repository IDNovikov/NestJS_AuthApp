import { ChatUserDTO } from './chat-user.dto';

export type ChatRoomDTO = {
  id: number;
  name: string | null;
  members: ChatUserDTO[];
};
