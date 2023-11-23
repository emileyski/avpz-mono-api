import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat } from './entities/chat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { ChatUser } from './entities/chat-user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(ChatUser)
    private chatUserRepository: Repository<ChatUser>,
  ) {}
  async create(createChatDto: CreateChatDto, userId: string) {
    // const chatUsers = this.
    // await this.chatRepository.save(chat);
    // return chat;

    const chat = this.chatRepository.create({
      // chatUsers,
    });

    await this.chatRepository.save(chat);

    const chatUsers = this.chatUserRepository.create([
      { user: { id: userId }, chat },
      { user: { id: createChatDto.interlocutorId }, chat },
    ]);

    await this.chatUserRepository.save(chatUsers);

    return { ...chat, members: chatUsers.map((chatUser) => chatUser.user) };
  }

  async findAllByUserId(userId: string) {
    //нужно получить все чаты, в которых участвует пользователь с userId и добавить информацию об остальных участниках

    const chats = await this.chatUserRepository.find({
      where: { user: { id: userId } },
      relations: ['chat', 'chat.chatUsers', 'chat.chatUsers.user'],
    });

    // return chats;

    return chats.map((c) => {
      const chat = c.chat;
      chat.chatUsers.forEach((chatUser) => {
        delete chatUser.user.password;
        delete chatUser.user.token;
        delete chatUser.user.createdAt;
        delete chatUser.user.role;
        delete chatUser.user.birthDate;
        delete chatUser.user.about;
        delete chatUser.user.strategy;
        chatUser.user.picture = ``;
      });
      return { ...chat };
    });
  }
}
