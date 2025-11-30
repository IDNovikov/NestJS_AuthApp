// src/modules/chat/infrastructure/ws/chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatFacade } from '../../application/chat.facade';
import { SendMessageDto } from '../../application/dto/send-message.dto';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ChatDTO } from '../../application/dto/chat.dto';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*', // в продакшене лучше указать домены фронтенда
    methods: ['GET', 'POST'],
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly facade: ChatFacade,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        this.logger.warn(`Unauthorized client tried to connect`);
        client.emit('error', 'Unauthorized');
        client.disconnect();
        return;
      }

      let payload;
      try {
        payload = this.jwtService.verify(token);
      } catch (error) {
        this.logger.warn(`Invalid token`);
        client.emit('error', 'Invalid token');
        client.disconnect();
        return;
      }

      client.data.userId = payload.sub;

      this.logger.log(`Client connected: ${client.id}, userId: ${payload.sub}`);

      const userChats = await this.facade.getMappedChatsByUserId(payload.sub);

      if (userChats?.length) {
        userChats.forEach((chat: ChatDTO) => client.join(chat.id.toString()));
      }

      return client.emit('chat.init', userChats);
    } catch (err) {
      this.logger.error(`Connection error: ${err.message}`);
      client.disconnect();
      return;
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(
      `Client disconnected: ${client.id}, userId: ${client.data.userId}`,
    );
    client.disconnect();
  }

  @SubscribeMessage('message.send')
  async handleSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { chatId: string; text: string },
  ) {
    const userId = client.data.userId;
    if (!userId) throw new WsException('Unauthorized');
    try {
      const dto: SendMessageDto = { chatId: body.chatId, text: body.text };
      const messageView = await this.facade.sendMessage(userId, dto);

      this.emitToChat(Number(body.chatId), 'message.new', messageView);

      return messageView;
    } catch (err) {
      this.logger.error(`Failed to send message: ${err.message}`);
      throw new WsException('Message sending failed');
    }
  }

  emitToChat(chatId: number, event: string, payload: unknown) {
    this.server.to(chatId.toString()).emit(event, payload);
  }

  // emitToUser(userId: number, event: string, payload: unknown) {
  //   this.server.sockets.sockets.forEach((socket) => {
  //     if (socket.data.userId === userId) {
  //       socket.emit(event, payload);
  //     }
  //   });
  // }
}
