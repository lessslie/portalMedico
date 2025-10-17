import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TeleconsultationsService } from './teleconsultations.service';
import { CreateMessageDto } from './dtos/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TeleconsultationsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly teleService: TeleconsultationsService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    await client.join(room);
    client.emit('joinedRoom', { room });
  }


  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CreateMessageDto,
  ) {
    const saved = await this.teleService.saveMessage(payload);
    this.server.to(payload.teleconsultationId).emit('newMessage', saved);
    return saved;
  }
}
