import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMember } from './entities/chat-member.entity';
import { Chat } from './entities/chat.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, ChatMember]), UserModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
