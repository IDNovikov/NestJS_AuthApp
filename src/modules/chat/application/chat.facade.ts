import { Injectable } from '@nestjs/common';
import { ChatDomainService } from '../domain/services/chat.domain-service';
import { SendMessageDto } from './dto/send-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { GetHistoryDto } from './dto/get-history.dto';
import { ChatDTO } from './dto/chat.dto';
import { ChatMapper } from './mappers/chat.mapper';

@Injectable()
export class ChatFacade {
  constructor(private readonly domain: ChatDomainService) {}

  async getMappedChatsByUserId(id: number): Promise<ChatDTO[]> {
    const chats = await this.domain.getChatsByUserId(id);
    const view = chats.map((chat) => ChatMapper.toDTO(chat));
    return view;
  }

  //return dto
  async sendMessage(userId: string, dto: SendMessageDto): Promise<any> {
    await this.domain.sendMessage(dto);
  }

  async editMessage(userId: string, dto: EditMessageDto): Promise<any> {}

  async getHistory(dto: GetHistoryDto): Promise<any> {}
}

// Логика:
// facade:
// принимает userId (из JWT или из сокета)
// валидирует DTO (через пайпы/классы)
// вызывает доменный сервис
// мапит entity → ViewDto
