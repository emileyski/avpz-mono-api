import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ChildEntity, Repository } from 'typeorm';
import { ChatMember } from './entities/chat-member.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
    @InjectRepository(ChatMember)
    private chatMembersRepository: Repository<ChatMember>,
    private usersService: UserService,
  ) {}
  async create(userId: string, createChatDto: CreateChatDto) {
    const interlocutor = await this.usersService.findOne(
      createChatDto.interlocutorId,
    );

    if (!interlocutor) {
      throw new NotFoundException('Interlocutor not found');
    }

    const chat = this.chatsRepository.create({
      chatMembers: [
        {
          user: { id: createChatDto.interlocutorId },
        },
        {
          user: { id: userId },
        },
      ],
    });

    await this.chatsRepository.save(chat);
    await this.chatMembersRepository.save(
      chat.chatMembers.map((cm) => ({ ...cm, chat: { id: chat.id } })),
    );

    return chat;
  }

  async findAll(userId: string) {
    // Найти все чаты, в которых участвует пользователь
    const userChats = await this.chatMembersRepository.find({
      where: { user: { id: userId } },
      relations: ['chat', 'chat.chatMembers', 'chat.chatMembers.user'],
    });

    // Извлечь уникальные чаты из результата (если это необходимо)
    const uniqueChats = Array.from(
      new Set(userChats.map((chatMember) => chatMember.chat)),
    );

    // Получить всех участников этих чатов без дублирования
    const chatMembersWithUsers = uniqueChats.map((chat) => {
      const uniqueMembers = Array.from(
        new Set(chat.chatMembers.map((member) => member.user)),
      );

      return {
        chat: {
          id: chat.id,
          name: chat.name,
          createdAt: chat.createdAt,
        },
        members: uniqueMembers.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          birthDate: user.birthDate,
          createdAt: user.createdAt,
          about: user.about,
          nickname: user.nickname,
          gender: user.gender,
          picture: user.picture
            ? `${process.env.APPLICATION_URL}/files/${user.picture}`
            : undefined,
          strategy: user.strategy,
        })),
      };
    });

    return chatMembersWithUsers;
  }

  //TODO: отрефакторить этот код
  async findOne(id: string, userId: string) {
    const chat = await this.chatsRepository.findOne({
      where: { id },
      relations: [
        'chatMembers',
        'chatMembers.user',
        'messages',
        'messages.user',
      ],
    });

    if (
      !chat ||
      !chat.chatMembers.some((member) => member.user.id === userId)
    ) {
      throw new NotFoundException('Chat not found');
    }

    return {
      ...chat,
      chatMembers: chat.chatMembers.map((member) => {
        const chatMember = {
          ...member,
          user: {
            ...this.clearUserData(member.user),
            picture: member.user.picture
              ? `${process.env.APPLICATION_URL}/files/${member.user.picture}`
              : undefined,
          },
        };

        return chatMember;
      }),
      messages: chat.messages.map((message) => {
        const chatMember = {
          ...message,
          user: {
            ...this.clearUserData(message.user),
            picture: message.user.picture
              ? `${process.env.APPLICATION_URL}/files/${message.user.picture}`
              : undefined,
          },
        };

        return chatMember;
      }),
    };
  }

  async remove(id: string, userId: string) {
    const chat = await this.chatsRepository.findOne({
      where: { id },
      relations: ['chatMembers', 'chatMembers.user'],
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (!chat.chatMembers.some((member) => member.user.id === userId)) {
      throw new NotFoundException('Chat not found');
    }

    await this.chatsRepository.remove(chat);

    return { message: `Chat #${id} was deleted` };
  }

  clearUserData(user: User) {
    delete user.token;
    delete user.password;
    delete user.role;
    delete user.strategy;
    delete user.createdAt;
    delete user.birthDate;

    return user;
  }
}
