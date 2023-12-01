import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Chat } from 'src/chat/entities/chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Chat])],
  providers: [MessageGateway, MessageService],
})
export class MessageModule {}
