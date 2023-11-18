import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
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

  // @UseGuards(AccessTokenGuard)
  // @Post(':id/repply')
  // repplyToComment(
  //   @UserId() userId: string,
  //   @Param('id') id: string,
  //   @Body('comment') comment: string,
  // ) {
  //   return this.commentsService.repplyToComment(id, userId, comment);
  // }

  @UseGuards(AccessTokenGuard)
  @Patch(':id/like')
  like(@Param('id') id: string, @UserId() userId: string) {
    return this.commentsService.like(id, userId);
  }

  @UseGuards(AccessTokenGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body('comment') comment: string,
    @UserId() userId: string,
  ) {
    return this.commentsService.update(id, comment, userId);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @UserId() userId: string) {
    return this.commentsService.remove(id, userId);
  }
}
