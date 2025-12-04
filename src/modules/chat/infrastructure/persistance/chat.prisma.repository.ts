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
    limit = 1,
    cursor?: number,
  ): Promise<ChatRoom[]> {
    const userChats = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        chats: {
          take: limit,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: { updatedAt: 'desc' },
          include: {
            members: { select: { id: true, userName: true, userImage: true } },
          },
        },
      },
    });

    if (!userChats) return [];
    return userChats.chats.map((c) => ChatRoom.restore(c));
  }

  async findRoomById(chatId: number): Promise<ChatRoom | null> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        members: { select: { id: true, userName: true, userImage: true } },
      },
    });
    if (!chat) return null;
    return ChatRoom.restore(chat);
  }

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

  async getUsersChats(
    userId: number,
    limit = 20,
    cursor: number,
  ): Promise<ChatRoom[]> {
    const chats = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        chats: {
          orderBy: { updatedAt: 'desc' },
          take: limit,
          cursor: cursor ? { id: cursor } : undefined,
          skip: cursor ? 1 : 0,
          include: {
            members: { select: { id: true, userName: true, userImage: true } },
          },
        },
      },
    });

    if (!chats?.chats.length) return [];
    return chats.chats.flatMap((chat) => ChatRoom.restore(chat));
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
      skip: cursor ? 1 : 0,
    });
    const nextCursor =
      messagesDB.length === limit
        ? messagesDB[messagesDB.length - 1].id
        : undefined;
    const messages = messagesDB.map((m) => ChatMessage.restore(m));
    return { messages, nextCursor };
  }

  async editMembersInChat(
    chatId: number,
    members: ChatUser[],
  ): Promise<ChatRoom> {
    const updated = await this.prisma.chat.update({
      where: { id: chatId },
      data: {
        members: {
          set: members.map((member) => ({ id: member.ChatUser.id })),
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
          connect: chat.members.map((m) => ({ id: m.ChatUser.id })),
        },
      },
      include: {
        members: { select: { id: true, userName: true, userImage: true } },
      },
    });
    return ChatRoom.restore(created);
  }

  async isPrivateChatExist(members: ChatUser[]): Promise<ChatRoom | null> {
    const chats = await this.prisma.chat.findMany({
      where: {
        members: {
          some: { id: members[0].ChatUser.id },
        },
      },
      include: {
        members: true,
      },
    });

    const existing = chats.find(
      (c) =>
        c.members.length === 2 &&
        c.members.some((m) => m.id === members[0].ChatUser.id) &&
        c.members.some((m) => m.id === members[1].ChatUser.id),
    );

    if (!existing) return null;

    return ChatRoom.restore(existing);
  }
}
