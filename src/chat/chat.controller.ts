import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { AccessTokenGuard } from 'src/core/guards/access-token.guard';
import { UserId } from 'src/core/decorators/user-id.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  create(@Body() createChatDto: CreateChatDto, @UserId() userId: string) {
    return this.chatService.create(createChatDto, userId);
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  findAll(@UserId() userId: string) {
    return this.chatService.findAllByUserId(userId);
  }
}
