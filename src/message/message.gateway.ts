import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageService } from './message.service';
import { Server, Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import {
  AuthenticatedSocket,
  SocketAuthMiddleware,
} from 'src/core/middlewares/ws.mw';
import { UpdateMessageDto } from './dto/update-message.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { DeleteMessageDto } from './dto/delete-message.dto';

@WebSocketGateway({ namespace: 'message' })
export class MessageGateway implements OnModuleInit {
  constructor(private readonly messageService: MessageService) {}
  @WebSocketServer()
  server: Server;

  clients: AuthenticatedSocket[] = [];

  onModuleInit() {
    this.server.on('connection', (client: any) => {
      this.clients.push(client);
      client.on('disconnect', () => {
        this.clients = this.clients.filter((c) => c.id !== client.id);
      });
    });
  }

  afterInit(client: Socket) {
    client.use(SocketAuthMiddleware() as any);
  }

  @SubscribeMessage('newMessage')
  async onNewMessage(client: AuthenticatedSocket, boilerplateData: string) {
    try {
      // Получаем информацию о пользователе из payload
      const data = JSON.parse(boilerplateData) as CreateMessageDto;

      const { message, chatMemberIds } = await this.messageService.create(
        data,
        client.user.id,
      );

      chatMemberIds.forEach((chatMemberId) => {
        const recipient = this.clients.find((c) => c.user.id === chatMemberId);

        if (recipient) {
          recipient.emit('newMessage', {
            message,
            from: client.user.id,
          });
        }
      });

      return message;
    } catch (e) {
      return e;
    }
  }

  @SubscribeMessage('updateMessage')
  async onUpdateMessage(client: AuthenticatedSocket, boilerplateData: string) {
    try {
      const data = JSON.parse(boilerplateData) as UpdateMessageDto;

      const { message, chatMemberIds } = await this.messageService.update(
        data,
        client.user.id,
      );

      chatMemberIds.forEach((chatMemberId) => {
        const recipient = this.clients.find((c) => c.user.id === chatMemberId);

        if (recipient) {
          recipient.emit('updateMessage', {
            message,
            from: client.user.id,
          });
        }
      });

      return message;
    } catch (e) {
      return e;
    }
  }

  @SubscribeMessage('deleteMessage')
  async onDeleteMessage(client: AuthenticatedSocket, boilerplateData: string) {
    try {
      const data = JSON.parse(boilerplateData) as DeleteMessageDto;

      const { message, chatMemberIds } = await this.messageService.remove(
        data,
        client.user.id,
      );

      chatMemberIds.forEach((chatMemberId) => {
        const recipient = this.clients.find((c) => c.user.id === chatMemberId);

        if (recipient) {
          recipient.emit('deleteMessage', {
            message: { ...message, id: data.id },
            from: client.user.id,
          });
        }
      });

      return message;
    } catch (e) {
      return e;
    }
  }
}
