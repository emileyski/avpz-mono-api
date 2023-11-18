import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentLike } from './entities/comment-like.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private commentLikeRepository: Repository<CommentLike>,
  ) {}

  create(body: string, postId: string, userId: string) {
    return this.commentRepository.save({
      body,
      post: { id: postId },
      user: { id: userId },
    });
  }

  //TODO: implement this method
  async update(id: string, body: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!comment) throw new NotFoundException('Comment not found');

    comment.body = body;

    await this.commentRepository.save(comment);

    return { comment };
  }

  async like(id: string, userId: string) {
    const existedLike = await this.commentLikeRepository.findOne({
      where: { comment: { id }, user: { id: userId } },
    });

    if (existedLike) {
      await this.commentLikeRepository.delete(existedLike.id);
      return { message: 'Comment unliked successfully', liked: false };
    }

    await this.commentLikeRepository.save({
      comment: { id },
      user: { id: userId },
    });

    return { message: 'Comment liked successfully', liked: true };
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

  // async repplyToComment(id: string, userId: string, commentText: string) {
  //   const comment = await this.commentRepository.findOne({
  //     where: { id, user: { id: userId } },
  //     relations: ['post'],
  //   });

  //   if (!comment) throw new NotFoundException('Comment not found');

  //   const repply = this.commentRepository.create({
  //     body: commentText,
  //     user: { id: userId },
  //     parentComment: { id },
  //     post: { id: comment.post.id },
  //   });

  //   await this.commentRepository.save(repply);

  //   comment.reppliesCount += 1;
  //   await this.commentRepository.save(comment);

  //   return { repply };
  // }

  async getCommentsForPost(postId: string) {
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .select([
        'comment.id',
        'comment.body',
        'comment.createdAt',
        'user.id',
        'user.name',
        'user.picture',
      ])
      .addSelect('COUNT(commentLike.id)', 'likesCount') // Add likesCount to the select
      .innerJoin('comment.user', 'user')
      .leftJoin('comment.likes', 'commentLike') // Left join to include likes
      .where('comment.post.id = :postId', {
        postId,
      })
      .groupBy('comment.id, user.id') // Group by comment and user to avoid duplicates
      .getRawMany();

    // Map the result to add likesCount to each comment object
    const commentsWithLikes = comments.map((comment) => ({
      id: comment.comment_id,
      body: comment.comment_body,
      createdAt: comment.comment_createdAt,
      user: {
        id: comment.user_id,
        name: comment.user_name,
        picture: comment.user_picture,
      },
      likesCount: parseInt(comment.likesCount, 10) || 0, // Convert likesCount to number or set to 0
    }));

    return commentsWithLikes;
  }
}

// {
//   "id": "55410b9c-d964-4625-beee-9339e9721d10",
//   "body": "something here",
//   "createdAt": "2023-11-17T13:51:01.332Z",
//   "user": {
//       "id": "e7aa3ebf-fc01-4994-82ef-07e60238c354",
//       "name": "Emil",
//       "picture": "634c19be-8e2f-4086-819a-85ef98041e8a"
//   }
// },
