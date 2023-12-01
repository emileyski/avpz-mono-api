import { Injectable } from '@nestjs/common';
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

    return { message, chatMemberIds: chat.chatMembers.map((cm) => cm.user.id) };
  }

  findAll() {
    return `This action returns all message`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
