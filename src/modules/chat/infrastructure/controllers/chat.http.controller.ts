// src/modules/chat/infrastructure/controllers/chat.http.controller.ts
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ChatFacade } from '../../application/chat.facade';
import { SendMessageDto } from '../../application/dto/send-message.dto';
import { EditMessageDto } from '../../application/dto/edit-message.dto';
import { GetHistoryDto } from '../../application/dto/get-history.dto';

//ЗАчем вообще контроллер нужен? Для админа?
@Controller('chat')
export class ChatHttpController {
  constructor(private readonly facade: ChatFacade) {}

  @Post(':chatId/messages')
  async sendMessage(
    @Param('chatId') chatId: string,
    @Body() body: Omit<SendMessageDto, 'chatId'>,
  ) {
    const userId = crypto.randomUUID(); // из JWT
    const dto: SendMessageDto = { chatId, text: body.text };
    return this.facade.sendMessage(userId, dto);
  }

  @Post('messages/:messageId/edit')
  async editMessage(
    @Param('messageId') messageId: string,
    @Body() body: Omit<EditMessageDto, 'messageId'>,
  ) {
    const userId = crypto.randomUUID();
    const dto: EditMessageDto = { messageId, newText: body.newText };
    return this.facade.editMessage(userId, dto);
  }

  @Get(':chatId/messages')
  async getHistory(
    @Param('chatId') chatId: string,
    @Query() query: Partial<GetHistoryDto>,
  ) {
    const dto: GetHistoryDto = {
      chatId,
      limit: query.limit ? Number(query.limit) : 50,
      offset: query.offset ? Number(query.offset) : 0,
    };
    return this.facade.getHistory(dto);
  }
}
