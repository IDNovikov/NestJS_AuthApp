import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { instrument } from '@socket.io/admin-ui';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: true,
  },
})
export class WSRoot implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    instrument(server, {
      auth: false,
    });
    console.log('Socket.IO Admin UI connected: https://admin.socket.io/#/');
  }
}
