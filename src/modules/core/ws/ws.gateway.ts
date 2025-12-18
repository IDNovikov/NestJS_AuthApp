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
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatFacade } from '@/modules/chat/application/chat.facade';
import { ChatDTO } from '@/modules/chat/application/dto/chat.dto';
import { SendMessageDto } from '@/modules/chat/application/dto/send-message.dto';
import { EditMessageDto } from '@/modules/chat/application/dto/edit-message.dto';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class WSChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(WSChatGateway.name);

  constructor(
    private readonly facade: ChatFacade,
    private readonly jwt: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        this.extractBearer(
          client.handshake.headers?.authorization as string | undefined,
        );

      if (!token) return this.reject(client, 'Unauthorized');

      let payload: {
        sub: number;
        email: string;
        role: string;
        jti: string;
        iat: number;
        exp: number;
      };
      try {
        payload = this.jwt.verify(token);
      } catch (error) {
        return this.reject(client, 'Invalid token');
      }

      client.data.userId = payload.sub;
      this.logger.log(`Client connected: ${client.id}, userId: ${payload.sub}`);

      const userChats = await this.facade.getUsersChats({
        userId: payload.sub,
      });

      if (!userChats) throw new WsException('No chats');
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
  }

  @SubscribeMessage('message.send')
  async handleSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: SendMessageDto,
  ) {
    const userId = client.data.userId;
    if (!userId) throw new WsException('Unauthorized');
    if (!body.chatId) throw new WsException('ChatId required');
    try {
      const view = await this.facade.sendChatMessage(userId, body);
      this.server.to(body.chatId.toString()).emit('message.new', view);
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
    if (!body.messageId) throw new WsException('Message id required');
    try {
      const view = await this.facade.editChatMessage(userId, body);
      if (!view) throw new WsException('No chats');
      this.server.to(view.chatId.toString()).emit('message.edited', view);
      return client.emit('message.edit', view);
    } catch (err) {
      this.logger.error(`Failed to send message: ${err.message}`);
      throw new WsException(`Edit failed ${err.message}`);
    }
  }

  emitToChat(chatId: number, event: string, payload: unknown) {
    this.server.to(chatId.toString()).emit(event, payload);
  }

  private reject(client: Socket, reason: string) {
    client.emit('exception', { message: reason });
    client.disconnect();
  }
  private extractBearer(value?: string): string | undefined {
    if (!value) return;
    const m = value.match(/^Bearer\s+(.+)$/i);
    return m?.[1];
  }
}
