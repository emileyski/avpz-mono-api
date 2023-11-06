import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
  ) {}

  create(createCommentDto: CreateCommentDto, postId: string, userId: string) {
    return this.commentRepository.save({
      ...createCommentDto,
      post: { id: postId },
      user: { id: userId },
    });
  }

  //TODO: implement this method
  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  async remove(id: string, userId: string) {
    const deleteResult = await this.commentRepository.delete({
      id,
      user: { id: userId },
    });

    if (deleteResult.affected === 0) {
      throw new NotFoundException('Comment not found');
    }

    return { message: `Comment ${id} deleted successfully` };
  }
}
