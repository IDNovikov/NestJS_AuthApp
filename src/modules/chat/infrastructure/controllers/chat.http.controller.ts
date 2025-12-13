// // src/modules/chat/infrastructure/controllers/chat.http.controller.ts
// import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
// import { ChatFacade } from '../../application/chat.facade';
// import { SendMessageDto } from '../../application/dto/send-message.dto';
// import { EditMessageDto } from '../../application/dto/edit-message.dto';
// import { GetMessagesDto } from '../../application/dto/get-messages.dto';

// //ЗАчем вообще контроллер нужен? Для админа?
// @Controller('chat')
// export class ChatHttpController {
//   constructor(private readonly facade: ChatFacade) {}

//   @Post(':chatId/messages')
//   async sendMessage(
//     @Param('chatId') chatId: string,
//     @Body() body: Omit<SendMessageDto, 'chatId'>,
//   ) {
//     const userId = crypto.randomUUID(); // из JWT
//     const dto: SendMessageDto = { chatId, text: body.text };
//     return this.facade.sendMessage(userId, dto);
//   }

//   @Post('messages/:messageId/edit')
//   async editMessage(
//     @Param('messageId') messageId: string,
//     @Body() body: Omit<EditMessageDto, 'messageId'>,
//   ) {
//     const userId = crypto.randomUUID();
//     const dto: EditMessageDto = { messageId, newText: body.newText };
//     return this.facade.editChatMessage(userId, dto);
//   }

//   @Get(':chatId/messages')
//   async getHistory(
//     @Param('chatId') chatId: number,
//     @Query() query: Partial<GetMessagesDto>,
//   ) {
//     const dto: GetMessagesDto = {
//       chatId,
//       userId,
//       limit: query.limit ? Number(query.limit) : 50,
//       cursor: query.cursor ? query.cursor : undefined,
//     };
//     return this.facade.getChatMessages(dto);
//   }
// }
