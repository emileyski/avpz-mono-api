import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ForumService } from './forum.service';
import { Server, Socket } from 'socket.io';
import {
  AuthenticatedSocket,
  SocketAuthMiddleware,
} from 'src/core/middlewares/ws.mw';
import { OnModuleInit } from '@nestjs/common';
import { CreateForumMessageDto } from './dto/create-forum-message-dto';
import { UpdateForumMessageDto } from './dto/update-forum-message-dto';

@WebSocketGateway({ namespace: 'forum' })
export class ForumGateway implements OnModuleInit {
  constructor(private readonly forumService: ForumService) {}

  @WebSocketServer()
  server: Server;

  clients: AuthenticatedSocket[] = [];

  afterInit(client: Socket) {
    client.use(SocketAuthMiddleware() as any);
  }

  onModuleInit() {
    this.server.on('connection', (client: any) => {
      this.clients.push(client);
      client.on('disconnect', () => {
        this.clients = this.clients.filter((c) => c.id !== client.id);
      });
    });
  }

  @SubscribeMessage('newMessage')
  async onNewMessage(client: AuthenticatedSocket, data: CreateForumMessageDto) {
    try {
      const { message, forumMemberIds } = await this.forumService.createMessage(
        data,
        client.user.id,
      );

      forumMemberIds.forEach((chatMemberId) => {
        const recipient = this.clients.find((c) => c.user.id === chatMemberId);

        if (recipient) {
          recipient.emit('newForumMessage', {
            message,
            from: client.user.id,
          });
        }
      });

      return message;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  @SubscribeMessage('updateMessage')
  async onUpdateMessage(
    client: AuthenticatedSocket,
    data: UpdateForumMessageDto,
  ) {
    try {
      const { message, forumMemberIds } = await this.forumService.updateMessage(
        data,
        client.user.id,
      );

      forumMemberIds.forEach((chatMemberId) => {
        const recipient = this.clients.find((c) => c.user.id === chatMemberId);

        if (recipient) {
          recipient.emit('updateForumMessage', {
            message,
            from: client.user.id,
          });
        }
      });

      return message;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  @SubscribeMessage('deleteMessage')
  async onDeleteMessage(
    client: AuthenticatedSocket,
    data: { messageId: string },
  ) {
    try {
      const { message, forumMemberIds } = await this.forumService.deleteMessage(
        data.messageId,
        client.user.id,
      );

      forumMemberIds.forEach((chatMemberId) => {
        const recipient = this.clients.find((c) => c.user.id === chatMemberId);

        if (recipient) {
          recipient.emit('deleteForumMessage', {
            message,
            from: client.user.id,
          });
        }
      });

      return message;
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}
