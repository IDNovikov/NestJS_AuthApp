//port to prisma service

import { ChatDTO } from '../../application/dto/chat.dto';
import { ChatMessage } from '../entities/chat-message.entity';
import { ChatRoom } from '../entities/chat-room.entity';

export abstract class ChatRepository {
  abstract getChatsByUserId(
    userId: number,
    massgesLimit?: number,
  ): Promise<ChatDTO[]>;

  abstract findRoomById(chatId: number): Promise<ChatRoom | null>;

  abstract saveMessage(message);
  abstract getMessageById(id: string): Promise<ChatMessage | null>;
}

// domain знает только абстракции:
// где хранится — не важно (Postgres, Mongo, in-memory)
// как рассылаются события — не важно (socket.io, Kafka и т.п.)
