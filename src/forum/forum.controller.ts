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
import { ForumService } from './forum.service';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/core/guards/access-token.guard';
import { UserId } from 'src/core/decorators/user-id.decorator';
import { set } from 'mongoose';
import { SetForumRoleDto } from './dto/set-forum-role.dto';

@ApiUnauthorizedResponse({
  description: 'You are not authorized, Please provide valid access token',
})
@ApiTags('forum')
@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Post()
  create(@Body() createForumDto: CreateForumDto, @UserId() userId: string) {
    return this.forumService.create(createForumDto, userId);
  }

  // @ApiBearerAuth()
  // @UseGuards(AccessTokenGuard)
  @Get()
  findAll() {
    return this.forumService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Post(':id/join')
  join(@Param('id') id: string, @UserId() userId: string) {
    return this.forumService.join(id, userId);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Patch('set-forum-role')
  setForumRole(
    @UserId() userId: string,
    @Body() setForumRoleDto: SetForumRoleDto,
  ) {
    return this.forumService.setForumRole(userId, setForumRoleDto);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateForumDto: UpdateForumDto,
    @UserId() userId: string,
  ) {
    return this.forumService.update(id, userId, updateForumDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserId() userId: string) {
    return this.forumService.remove(id, userId);
  }
}
