import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { Chat } from 'src/chat/entities/chat.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
  ) {}
  async create(createMessageDto: CreateMessageDto, userId: string) {
    const message = this.messagesRepository.create({
      user: { id: userId },
      text: createMessageDto.text,
      chat: { id: createMessageDto.chatId },
    });
    await this.messagesRepository.save(message);

    const chat = await this.chatsRepository.findOne({
      where: { id: createMessageDto.chatId },
      relations: ['chatMembers', 'chatMembers.user'],
    });

    return {
      message,
      chatMemberIds: chat.chatMembers
        .map((cm) => cm.user.id)
        .filter((id) => id !== userId),
    };
  }

  async update(updateMessageDto: UpdateMessageDto, userId: string) {
    console.log(updateMessageDto, userId);

    const message = await this.messagesRepository.findOne({
      where: { id: updateMessageDto.id, user: { id: userId } },
      relations: ['chat'],
    });

    if (!message) {
      throw new ForbiddenException(
        'You are not allowed to update this message or message does not exist',
      );
    }

    message.text = updateMessageDto.text;

    await this.messagesRepository.save(message);

    const chat = await this.chatsRepository.findOne({
      where: { id: updateMessageDto.chatId },
      relations: ['chatMembers', 'chatMembers.user'],
    });

    return {
      message,
      chatMemberIds: chat.chatMembers
        .map((cm) => cm.user.id)
        .filter((id) => id !== userId),
    };
  }

  async remove(updateMessageDto: UpdateMessageDto, userId: string) {
    const message = await this.messagesRepository.findOne({
      where: { id: updateMessageDto.id, user: { id: userId } },
      relations: ['chat'],
    });

    if (!message) {
      throw new ForbiddenException(
        'You are not allowed to delete this message or message does not exist',
      );
    }

    await this.messagesRepository.remove(message);

    const chat = await this.chatsRepository.findOne({
      where: { id: updateMessageDto.chatId },
      relations: ['chatMembers', 'chatMembers.user'],
    });

    return {
      message,
      chatMemberIds: chat.chatMembers
        .map((cm) => cm.user.id)
        .filter((id) => id !== userId),
    };
  }
}
