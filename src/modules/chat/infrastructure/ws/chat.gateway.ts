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
import { EditMessageDto } from '../../application/dto/edit-message.dto';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*', // в продакшене лучше указать домены фронтенда
    methods: ['GET', 'POST', 'PUT'],
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

      const userChats = await this.facade.getUsersChats(payload.sub);
      if (userChats?.length) {
        userChats.forEach((chat: ChatDTO) => client.join(chat.id.toString()));
      }
      return;
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
    @MessageBody() body: SendMessageDto,
  ) {
    const userId = client.data.userId;
    if (!userId) throw new WsException('Unauthorized');
    try {
      const view = await this.facade.sendMessage(userId, body);
      return client.emit('message.send', view);
    } catch (err) {
      this.logger.error(`Failed to send message: ${err.message}`);
      throw new WsException(`Send ailed ${err.message}`);
    }
  }

  @SubscribeMessage('message.edit')
  async handleEdit(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: EditMessageDto,
  ) {
    const userId = client.data.userId;
    if (!userId) throw new WsException('Unauthorized');

    try {
      const view = await this.facade.editMessage(userId, body);
      return client.emit('message.edit', view);
    } catch (err) {
      this.logger.error(`Failed to send message: ${err.message}`);
      throw new WsException(`Edit failed ${err.message}`);
    }
  }

  emitToChat(chatId: number, event: string, payload: unknown) {
    this.server.to(chatId.toString()).emit(event, payload);
  }
}
