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
  async onNewMessage(client: AuthenticatedSocket, boilerplateData: string) {
    // Получаем информацию о пользователе из payload
    const data = JSON.parse(boilerplateData) as {
      text: string;
      chatId: string;
    };

    const { message, chatMemberIds } = await this.messageService
      .create(data, client.user.id)
      .then((res) => {
        res.chatMemberIds = res.chatMemberIds.filter(
          (id) => id !== client.user.id,
        );
        return res;
      });

    chatMemberIds.forEach((chatMemberId) => {
      const recipient = this.clients.find((c) => c.user.id === chatMemberId);

      console.log(recipient.user.id);

      if (recipient) {
        recipient.emit('newMessage', {
          message,
          from: client.user.id,
        });
      }
    });

    return message;
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
