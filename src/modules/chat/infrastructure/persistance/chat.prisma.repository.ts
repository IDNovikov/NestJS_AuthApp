// src/modules/chat/infrastructure/persistence/chat.prisma.repository.ts
import { Injectable } from '@nestjs/common';
import { ChatRepository } from '../../domain/ports/chat.repository';
import { ChatMessage } from '../../domain/entities/chat-message.entity';
import { ChatRoom } from '../../domain/entities/chat-room.entity';
import { PrismaService } from '@/modules/core/prisma/prisma.service';
import { Chat } from '../../domain/entities/chat.entity';
import { ChatUser } from '../../domain/entities/chat-user.entity';

@Injectable()
export class ChatPrismaRepository implements ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getChatsByUserId(
    userId: number,
    lastMessagesLimit = 20,
  ): Promise<Chat[]> {
    const userChats = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userName: true,
        userImage: true,
        chats: {
          include: {
            members: { select: { id: true, userName: true, userImage: true } },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: lastMessagesLimit,
              select: {
                id: true,
                chatId: true,
                text: true,
                authorId: true,
                createdAt: true,
                updatedAt: true,
                isEdited: true,
              },
            },
          },
        },
      },
    });

    if (!userChats) return [];

    return userChats.chats.map((c) => {
      return Chat.restore(
        c.id,
        c.name,
        c.members.map((m) => {
          return ChatUser.restore(m.id, m.userName, m.userImage);
        }),
        c.messages.map((m) => {
          return ChatMessage.restore(
            m.id,
            m.chatId,
            m.authorId,
            m.text,
            m.createdAt,
            m.updatedAt,
            m.isEdited,
          );
        }),
      );
    });
  }

  async findRoomById(chatId: number): Promise<ChatRoom | null> {
    // const room = await this.prisma.chatRoom.findUnique({ where: { id: chatId } });
    // мапим в доменную сущность
    return null as any; // заглушка
  }
  async saveMessage(id: string): Promise<ChatMessage | null> {
    return null as any; // заглушка
  }

  async getMessageById(id: string): Promise<ChatMessage | null> {
    return null as any; // заглушка
  }

  //   async saveMessage(message: ChatMessage): Promise<void> {
  //     // await this.prisma.chatMessage.upsert({ ... });
  //   }

  //   async findMessageById(messageId: string): Promise<ChatMessage | null> {
  //     // const row = await this.prisma.chatMessage.findUnique({ where: { id: messageId } });
  //     return null as any;
  //   }

  //   async getMessages(params: {
  //     chatId: string;
  //     limit: number;
  //     offset: number;
  //   }): Promise<ChatMessage[]> {
  //     // const rows = await this.prisma.chatMessage.findMany({...});
  //     return [];
  //   }
}

// реализует порт ChatRepository, мапит между Prisma-моделями и доменными сущностями.
