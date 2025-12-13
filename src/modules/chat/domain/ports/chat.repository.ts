//port to prisma service
import { ChatMessage } from '../entities/chat-message.entity';
import { ChatRoom } from '../entities/chat-room.entity';

export abstract class ChatRepository {
  //Chats
  abstract getChatById(chatId: number): Promise<ChatRoom | null>;
  abstract getUsersChats(
    userId: number,
    limit: number,
    cursor?: number,
  ): Promise<ChatRoom[]>;
  abstract updateChatRoom(chatRoom: ChatRoom): Promise<ChatRoom>;
  abstract createChatRoom(chat: ChatRoom): Promise<ChatRoom>;
  abstract isPrivateChatExist(
    userAId: number,
    userBId: number,
  ): Promise<ChatRoom | null>;

  //Messages
  abstract createMessage(message: ChatMessage): Promise<ChatMessage | null>;
  abstract getMessageById(id: string): Promise<ChatMessage | null>;
  abstract editMessage(message: ChatMessage): Promise<ChatMessage | null>;
  abstract getMessagesByChatId(
    chatId: number,
    limit?: number,
    cursor?: string,
  ): Promise<{ messages: ChatMessage[]; nextCursor?: string }>;
}
