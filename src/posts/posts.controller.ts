import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  NotFoundException,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UserId } from 'src/core/decorators/user-id.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from 'src/utils/file-upload.utils';
import { Public } from 'src/core/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/core/guards/access-token.guard';
import { OptionalAccessTokenGuard } from 'src/core/guards/optional-access-token.guard';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor('image', 10, {
      fileFilter: imageFileFilter,
    }),
  )
  create(
    @Body() createPostDto: CreatePostDto,
    @UserId() userId: string,
    @UploadedFiles() files,
  ) {
    if (!files) throw new NotFoundException('Image not found');
    return this.postsService.create(createPostDto, userId, files);
  }

  @UseGuards(OptionalAccessTokenGuard)
  @Get()
  findAll(@UserId() userId: string) {
    return this.postsService.findAll(userId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Public()
  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.postsService.getComments(id);
  }

  @UseGuards(AccessTokenGuard)
  @Put(':id')
  update(
    @Body() updatePostDto: CreatePostDto,
    @UserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.postsService.update(id, userId, updatePostDto);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @UserId() userId: string) {
    return this.postsService.remove(id, userId);
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/like')
  like(@Param('id') id: string, @UserId() userId: string) {
    return this.postsService.like(id, userId);
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/comment')
  comment(
    @Param('id') id: string,
    @UserId() userId: string,
    @Body('comment') comment: string,
  ) {
    return this.postsService.comment(id, userId, comment);
  }
}
