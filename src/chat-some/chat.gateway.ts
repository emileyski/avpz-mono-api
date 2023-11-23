import { OnModuleInit } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Socket } from 'socket.io';
import {
  AuthenticatedSocket,
  SocketAuthMiddleware,
} from 'src/core/middlewares/ws.mw';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  clients: AuthenticatedSocket[] = [];

  onModuleInit() {
    this.server.on('connection', (client: any) => {
      // console.log('New client connected', client.user.id);
      this.clients.push(client);
      // console.log(this.clients.length);
      client.on('disconnect', () => {
        this.clients = this.clients.filter((c) => c.id !== client.id);
      });
    });
  }

  afterInit(client: Socket) {
    client.use(SocketAuthMiddleware() as any);
  }

  @SubscribeMessage('newMessage')
  onNewMessage(client: AuthenticatedSocket, boilerplateData: string) {
    // Получаем информацию о пользователе из payload
    const data = JSON.parse(boilerplateData);
    const userInfo = client.user;

    // Отправляем сообщение только тому, кому оно адресовано
    const recipient = this.clients.find((c) => c.user.id === data.to);
    console.log(recipient.user.id);
    if (recipient) {
      recipient.emit('newMessage', {
        message: data.message,
        from: client.id,
        to: data.to,
        userInfo,
      });
    }
  }
}
//
