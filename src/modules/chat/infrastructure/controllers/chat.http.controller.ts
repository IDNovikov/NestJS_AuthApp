import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/shared/guards/jwt-auth.guard';
import { UseSwagger } from '@/common/decorators/swagger.decorator';
import { User } from '@/common/decorators/userRefreshToken.decorator';
import { ChatFacade } from '../../application/chat.facade';
import { ChatSwagger } from '../docs/chat.swagger.docs';
import { RolesGuard } from '@/modules/auth/shared/guards/roles.guard';
import { Roles } from '@/modules/auth/shared/decorators/roles.decorator';
import { GetChatsQueryDto } from '../dto/get-ChatsQuery.dto';
import { CreateChatDTO } from '../dto/create-Chat.dto';
import { GetMessagesQueryDto } from '../dto/get-MessagesQuery.dto';
import { CreateMessageDTO } from '../dto/create-message.dto';
import { EditMessageDTOO } from '../dto/edit-Message.dto';

@ApiTags('chats')
@Controller('chats')
export class ChatController {
  constructor(private readonly chatFacade: ChatFacade) {}

  // Chat rooms
  @UseGuards(JwtAuthGuard)
  @Get()
  @UseSwagger(...ChatSwagger.GetMyChats)
  async getMyChats(
    @User() user: { sub: number },
    @Query() query: GetChatsQueryDto,
  ) {
    return this.chatFacade.getUsersChats({
      userId: user.sub,
      limit: query.limit,
      cursor: query.cursor,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('user/:id')
  @UseSwagger(...ChatSwagger.AdminGetUserChats)
  async getUsersChats(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetChatsQueryDto,
  ) {
    return this.chatFacade.getUsersChats({
      userId: id,
      limit: query.limit,
      cursor: query.cursor,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseSwagger(...ChatSwagger.CreateChat)
  async createChat(@Body() dto: CreateChatDTO) {
    return this.chatFacade.createChat({
      ...dto,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('messages')
  @UseSwagger(...ChatSwagger.EditMessage)
  async editMessage(
    @User() user: { sub: number },
    @Body() dto: EditMessageDTOO,
  ) {
    return this.chatFacade.editChatMessage(user.sub, dto);
  }

  //TODO Переделать
  @UseGuards(JwtAuthGuard)
  @Patch(':chatId')
  @UseSwagger(...ChatSwagger.UpdateChat)
  async updateChat(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() dto: CreateChatDTO,
  ) {
    return this.chatFacade.updateChat({
      ...dto,
      id: chatId,
    });
  }

  // Messages
  @UseGuards(JwtAuthGuard)
  @Get(':chatId/messages')
  @UseSwagger(...ChatSwagger.GetMessages)
  async getMessages(
    @User() user: { sub: number },
    @Param('chatId', ParseIntPipe) chatId: number,
    @Query() query: GetMessagesQueryDto,
  ) {
    return this.chatFacade.getChatMessages({
      userId: user.sub,
      chatId,
      limit: query.limit,
      cursor: query.cursor,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':userId/:chatId/messages')
  @UseSwagger(...ChatSwagger.AdminGetMessages)
  async getUserMessages(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Query() query: GetMessagesQueryDto,
  ) {
    return this.chatFacade.getChatMessages({
      userId: userId,
      chatId,
      limit: query.limit,
      cursor: query.cursor,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':chatId/messages')
  @UseSwagger(...ChatSwagger.SendMessage)
  async sendMessage(
    @User() user: { sub: number },
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() dto: CreateMessageDTO,
  ) {
    return this.chatFacade.sendChatMessage(user.sub, {
      ...dto,
      chatId,
    });
  }
}
