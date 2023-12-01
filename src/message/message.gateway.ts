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
  onNewMessage(client: AuthenticatedSocket, boilerplateData: string) {
    // Получаем информацию о пользователе из payload
    const data = JSON.parse(boilerplateData);

    // Отправляем сообщение только тому, кому оно адресовано
    const recipient = this.clients.find((c) => c.user.id === data.to);
    console.log(recipient.user.id);
    if (recipient) {
      recipient.emit('newMessage', {
        message: data.body,
        from: client.user.id,
        to: data.to,
        // userInfo,
      });
    }
  }

  // @SubscribeMessage('createMessage')
  // create(@MessageBody() createMessageDto: CreateMessageDto) {
  //   return this.messageService.create(createMessageDto);
  // }

  // @SubscribeMessage('findAllMessage')
  // findAll() {
  //   return this.messageService.findAll();
  // }

  // @SubscribeMessage('findOneMessage')
  // findOne(@MessageBody() id: number) {
  //   return this.messageService.findOne(id);
  // }

  // @SubscribeMessage('updateMessage')
  // update(@MessageBody() updateMessageDto: UpdateMessageDto) {
  //   return this.messageService.update(updateMessageDto.id, updateMessageDto);
  // }

  // @SubscribeMessage('removeMessage')
  // remove(@MessageBody() id: number) {
  //   return this.messageService.remove(id);
  // }
}
