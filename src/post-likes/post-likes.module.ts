import { Module } from '@nestjs/common';
import { PostLikesService } from './post-likes.service';

@Module({
  providers: [PostLikesService],
})
export class PostLikesModule {}
