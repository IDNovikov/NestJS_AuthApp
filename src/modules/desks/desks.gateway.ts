import {
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Sticker } from '@prisma/client';

@WebSocketGateway({
  namespace: 'desks',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false,
  },
})
export class StickersGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(StickersGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('desk.join')
  handleJoinDesk(
    @ConnectedSocket() client: Socket,
    @MessageBody() deskId: number,
  ) {
    deskId = Number(deskId);

    if (!deskId || isNaN(deskId)) {
      return client.emit('desk.error', { message: 'Invalid deskId' });
    }

    for (const room of client.rooms) {
      if (room.startsWith('desks:')) {
        client.leave(room);
      }
    }

    client.join(`desks:${deskId}`);

    this.logger.log(`Client ${client.id} joined desks:${deskId}`);

    client.emit('desk.joined', { deskId });

    return { success: true };
  }

  private emit(event: string, deskId: number, payload: any) {
    const room = `desks:${deskId}`;
    this.logger.log(`Emit ${event} → ${room}`);
    this.server.to(room).emit(event, payload);
  }

  emitStickerCreated(sticker: Sticker) {
    this.emit('sticker.created', sticker.deskId, sticker);
  }

  emitStickerUpdated(sticker: Sticker) {
    this.emit('sticker.updated', sticker.deskId, sticker);
  }

  emitStickerDeleted(sticker: Sticker) {
    this.emit('sticker.deleted', sticker.deskId, { id: sticker.id });
  }
}
