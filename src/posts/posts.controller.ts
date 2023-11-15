import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
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

  @Public()
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
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
}
