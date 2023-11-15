import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { FilesModule } from 'src/files/files.module';
import { PostLike } from 'src/post-likes/post-like.entity';

@Module({
  imports: [FilesModule, TypeOrmModule.forFeature([Post, PostLike])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
