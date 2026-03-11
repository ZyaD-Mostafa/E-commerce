import { Injectable, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Socket } from 'socket.io';
import { UserRoleEnum } from 'src/common/enums/user.enums';
import { User } from 'src/DB/models/user.model';
import { TokenService } from 'src/Modules/token/token.service';
import { AuthGuard, SocketWithUser } from './auth/auth.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'public',
})
@UseGuards(AuthGuard)
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly tokenService: TokenService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async handleConnection(client: Socket) {
    console.log(`client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sayHi')
  handleEvent(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): string {
    console.log(`User ${(client as SocketWithUser).user?.firstname}`);
    
    console.log({ data });
    client.emit('sayHi', 'Hello from server');
    return data;
  }
}
