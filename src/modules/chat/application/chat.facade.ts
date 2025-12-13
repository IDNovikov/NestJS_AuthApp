import { Injectable } from '@nestjs/common';
import { ChatDomainService } from '../domain/services/chat.domain-service';
import { SendMessageDto } from './dto/send-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { ChatMessageMapper } from './mappers/chat-message.mapper';
import { ChatMessageDTO } from './dto/chat-message.dto';
import { CreateChatDTO } from './dto/create-chat.dto';
import { ChatRoomDTO } from './dto/chat-room.dto';
import { ChatRoomMapper } from './mappers/chat-room.mapper';
import { GetMessagesDto } from './dto/get-messages.dto';
import { GetChatsDTO } from './dto/get-chats.dto';

@Injectable()
export class ChatFacade {
  constructor(private readonly domain: ChatDomainService) {}

  //chatRooms
  async getUsersChats(dto: GetChatsDTO) {
    return (
      await this.domain.getChatsByUserId(dto.userId, dto.limit, dto.cursor)
    ).map((chat) => ChatRoomMapper.toDTO(chat));
  }

  async createChat(dto: CreateChatDTO): Promise<ChatRoomDTO> {
    return ChatRoomMapper.toDTO(
      await this.domain.createChat(dto.members, dto.name),
    );
  }
  async updateChat(dto: ChatRoomDTO): Promise<ChatRoomDTO> {
    return ChatRoomMapper.toDTO(await this.domain.updateChatData(dto));
  }

  //messages
  async sendChatMessage(
    userId: number,
    dto: SendMessageDto,
  ): Promise<ChatMessageDTO> {
    return ChatMessageMapper.toDTO(
      await this.domain.sendDomainMessage(userId, dto),
    );
  }
  async editChatMessage(
    userId: number,
    dto: EditMessageDto,
  ): Promise<ChatMessageDTO> {
    return ChatMessageMapper.toDTO(
      await this.domain.editDomainMessage(userId, dto),
    );
  }
  async getChatMessages(
    dto: GetMessagesDto,
  ): Promise<{ messages: ChatMessageDTO[]; nextCursor?: string }> {
    const { messages, nextCursor } = await this.domain.getMessages(
      dto.userId,
      dto.chatId,
      dto.limit,
      dto.cursor,
    );
    return {
      messages: messages.map((m) => ChatMessageMapper.toDTO(m)),
      nextCursor: nextCursor,
    };
  }
}
