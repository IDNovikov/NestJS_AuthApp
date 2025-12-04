//port to prisma service
import { ChatMessage } from '../entities/chat-message.entity';
import { ChatRoom } from '../entities/chat-room.entity';
import { ChatUser } from '../entities/chat-user.entity';
import { Chat } from '../entities/chat.entity';

export abstract class ChatRepository {
  //Messages

  abstract getChatsByUserId(
    userId: number,
    limit?: number,
    cursor?: number,
  ): Promise<ChatRoom[]>;
  abstract findRoomById(chatId: number): Promise<ChatRoom | null>;
  abstract getUsersChats(
    userId: number,
    limit: number,
    cursor: number,
  ): Promise<ChatRoom[]>;
  abstract editMembersInChat(
    chatId: number,
    users: ChatUser[],
  ): Promise<ChatRoom>;

  abstract createChatRoom(chat: ChatRoom): Promise<ChatRoom>;

  abstract isPrivateChatExist(members: ChatUser[]): Promise<ChatRoom | null>;

  //Messages

  abstract createMessage(message: ChatMessage): Promise<ChatMessage | null>;
  abstract getMessageById(id: string): Promise<ChatMessage | null>;
  abstract editMessage(message: ChatMessage): Promise<ChatMessage | null>;

  abstract getMessagesByChatId(
    chatId: number,
    limit: number,
    cursor?: string,
  ): Promise<{ messages: ChatMessage[]; nextCursor?: string }>;
}
