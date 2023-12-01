import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
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
    return this.chatService.create(userId, createChatDto);
  }

  //метод для поиска чатов, в которых участвует пользователь
  @UseGuards(AccessTokenGuard)
  @Get()
  findAll(@UserId() userId: string) {
    return this.chatService.findAll(userId);
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @UserId() userId: string) {
    return this.chatService.findOne(id, userId);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
  //   return this.chatService.update(+id, updateChatDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(+id);
  }
}
