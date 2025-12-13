import { Injectable } from '@nestjs/common';
import { ChatRepository } from '../../domain/ports/chat.repository';
import { ChatMessage } from '../../domain/entities/chat-message.entity';
import { ChatRoom } from '../../domain/entities/chat-room.entity';
import { PrismaService } from '@/modules/core/prisma/prisma.service';

@Injectable()
export class ChatPrismaRepository implements ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  //Chat
  async getUsersChats(
    userId: number,
    limit = 20,
    cursor?: number,
  ): Promise<ChatRoom[]> {
    const chats = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        chats: {
          orderBy: { updatedAt: 'desc' },
          take: limit,
          cursor: cursor ? { id: cursor } : undefined,
          skip: cursor ? 1 : undefined,
          include: {
            members: { select: { id: true, userName: true, userImage: true } },
          },
        },
      },
    });

    if (!chats?.chats.length) return [];
    return chats.chats.flatMap((chat) => ChatRoom.restore(chat));
  }

  async getChatById(chatId: number): Promise<ChatRoom | null> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        members: { select: { id: true, userName: true, userImage: true } },
      },
    });
    if (!chat) return null;
    return ChatRoom.restore(chat);
  }

  async updateChatRoom(chatRoom: ChatRoom): Promise<ChatRoom> {
    const updated = await this.prisma.chat.update({
      where: { id: chatRoom.id, updatedAt: chatRoom.updatedAt },
      data: {
        name: chatRoom.name,
        members: {
          set: chatRoom.members.map((m) => ({ id: m.id })),
        },
      },
      include: {
        members: { select: { id: true, userName: true, userImage: true } },
      },
    });
    return ChatRoom.restore(updated);
  }

  async createChatRoom(chat: ChatRoom): Promise<ChatRoom> {
    const created = await this.prisma.chat.create({
      data: {
        name: chat.name,
        members: {
          connect: chat.members.map((m) => ({ id: m.id })),
        },
      },
      include: {
        members: { select: { id: true, userName: true, userImage: true } },
      },
    });
    return ChatRoom.restore(created);
  }

  async isPrivateChatExist(
    userAId: number,
    userBId: number,
  ): Promise<ChatRoom | null> {
    const chat = await this.prisma.chat.findFirst({
      where: {
        AND: [
          { members: { some: { id: userAId } } },
          { members: { some: { id: userBId } } },
        ],
        members: {
          every: {
            id: { in: [userAId, userBId] },
          },
        },
      },
      include: { members: true },
    });

    return chat ? ChatRoom.restore(chat) : null;
  }

  //Messages

  async createMessage(message: ChatMessage): Promise<ChatMessage | null> {
    const sendedMessage = await this.prisma.message.create({
      data: message.Message,
    });
    if (!sendedMessage) return null;
    await this.prisma.chat.update({
      where: { id: message.Message.chatId },
      data: { updatedAt: message.Message.updatedAt },
    });
    return ChatMessage.restore(sendedMessage);
  }

  async getMessageById(id: string): Promise<ChatMessage | null> {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) return null;
    return ChatMessage.restore(message);
  }

  async editMessage(message: ChatMessage): Promise<ChatMessage | null> {
    const editedMessage = await this.prisma.message.update({
      where: { id: message.Message.id },
      data: message.Message,
    });
    if (!editedMessage) return null;
    return ChatMessage.restore(editedMessage);
  }

  async getMessagesByChatId(
    chatId: number,
    limit = 20,
    cursor?: string,
  ): Promise<{ messages: ChatMessage[]; nextCursor?: string }> {
    const messagesDB = await this.prisma.message.findMany({
      where: { chatId },
      cursor: cursor ? { id: cursor } : undefined,
      take: limit,
      orderBy: { createdAt: 'desc' },
      skip: cursor ? 1 : undefined,
    });
    const nextCursor =
      messagesDB.length === limit
        ? messagesDB[messagesDB.length - 1].id
        : undefined;
    const messages = messagesDB.map((m) => ChatMessage.restore(m));
    return { messages, nextCursor };
  }
}
