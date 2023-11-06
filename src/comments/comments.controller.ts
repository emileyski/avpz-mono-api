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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AccessTokenGuard } from 'src/core/guards/access-token.guard';
import { ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/core/decorators/user-id.decorator';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AccessTokenGuard)
  @Post(':id')
  create(
    @Body() createCommentDto: CreateCommentDto,
    @Param('id') id: string,
    @UserId() userId: string,
  ) {
    return this.commentsService.create(createCommentDto, id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(+id, updateCommentDto);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @UserId() userId: string) {
    return this.commentsService.remove(id, userId);
  }
}
