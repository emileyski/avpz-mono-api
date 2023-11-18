import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { FilesService } from 'src/files/files.service';
import { PostLike } from 'src/post-likes/post-like.entity';
import { CommentsService } from 'src/comments/comments.service';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';

@Injectable()
export class PostsService {
  API_URL: string = process.env.API_URL || 'http://localhost:3000';

  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private postLikesRepository: Repository<PostLike>,
    private readonly filesService: FilesService,
    private readonly commentsService: CommentsService,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    userId: string,
    files: any[],
  ): Promise<Post> {
    const filenames = await this.filesService.saveMany(files);

    const pictureIds = filenames.map((file) => file.id);

    const post = await this.postsRepository.create({
      ...createPostDto,
      user: { id: userId },
      pictures: pictureIds,
    });

    await this.postsRepository.save(post);
    return {
      ...post,
      pictures: filenames.map(
        (file) => `${this.API_URL}/api/files/${file.filename}`,
      ),
    };
  }

  async findAll(userId?: string) {
    const posts = await this.postsRepository
      .createQueryBuilder('post')
      .select([
        'post.id',
        'post.title',
        'post.body',
        'post.pictures',
        'post.createdAt',
        'user.name',
        'user.nickname',
        'user.id',
      ])
      .addSelect(['likes.id', 'likeUser.id'])
      .leftJoin('post.user', 'user')
      .leftJoin('post.likes', 'likes')
      .leftJoin('likes.user', 'likeUser')
      .leftJoinAndSelect('post.comments', 'comments')
      .getMany();

    // Добавляем поле isLiked в каждый пост
    posts.forEach((post) => {
      post.pictures = post.pictures.map(
        (picture) => `${this.API_URL}/api/files/${picture}`,
      );

      // Проверяем, есть ли свойство likes и лайкнут ли текущий пользователь этот пост
      post.isLiked = post.likes.some((like) => like.user.id === userId);
      post.likeCount = post.likes ? post.likes.length : 0;

      post.commentCount = post.comments ? post.comments.length : 0;

      delete post.comments; // Удаляем свойство comments
      delete post.likes; // Удаляем свойство likes
    });

    return posts;
  }

  async findOne(id: string, userId?: string) {
    const post = await this.postsRepository
      .createQueryBuilder('post')
      .select([
        'post.id',
        'post.title',
        'post.body',
        'post.pictures',
        'post.createdAt',
        'user.id',
        'user.name',
        'user.nickname',
        'comment.id',
        'comment.body',
        'comment.createdAt',
        'commentUser.id',
        'commentUser.name',
        'commentUser.nickname',
      ])
      .addSelect(['likes.id', 'likeUser.id'])
      .addSelect([
        'replies.id',
        'replies.body',
        'replies.createdAt',
        'replyUser.id',
        'replyUser.name',
      ]) // Include reply information
      .leftJoin('post.user', 'user')
      .leftJoin('post.comments', 'comment')
      .leftJoin('comment.user', 'commentUser') // Add user information for comments
      .leftJoin('post.likes', 'likes')
      .leftJoin('likes.user', 'likeUser')
      .leftJoinAndSelect('comment.replies', 'replies') // Include replies for comments
      .leftJoin('replies.user', 'replyUser') // Add user information for replies
      .where('post.id = :id', { id })
      .getOne();

    if (!post) throw new NotFoundException('Post not found');

    post.pictures = post.pictures.map(
      (picture) => `${this.API_URL}/api/files/${picture}`,
    );

    // Добавляем поле isLiked в каждый пост
    post.isLiked = post.likes.some((like) => like.user.id === userId);
    post.likeCount = post.likes ? post.likes.length : 0;

    delete post.likes; // Удаляем свойство likes

    return post;
  }

  async update(id: string, userId: string, updatePostDto: CreatePostDto) {
    const updateResult = await this.postsRepository.update(
      { id, user: { id: userId } },
      updatePostDto,
    );

    if (updateResult.affected === 0)
      throw new NotFoundException('Post not found or you are not the owner');

    return this.findOne(id);
  }

  async remove(id: string, userId: string) {
    const post = await this.postsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!post)
      throw new NotFoundException('Post not found or you are not the owner');

    const fileIds = post.pictures;

    await this.postsRepository.delete({
      id,
      user: { id: userId },
    });

    fileIds.map(async (id) => await this.filesService.deleteFileById(id));

    return { message: `Post with ID ${id} deleted successfully` };
  }

  async like(id: string, userId: string) {
    const existedLike = await this.postLikesRepository.findOne({
      where: { post: { id }, user: { id: userId } },
    });

    if (existedLike) {
      await this.postLikesRepository.delete({ id: existedLike.id });
      return {
        message: `Like to post ${id} removed successfully`,
        liked: false,
      };
    }

    const like = this.postLikesRepository.create({
      post: { id },
      user: { id: userId },
    });

    await this.postLikesRepository.save(like);

    return { message: `Like to post ${id} added successfully`, liked: true };
  }

  async comment(id: string, userId: string, comment: string) {
    return this.commentsService.create(comment, id, userId);
  }

  async getComments(id: string) {
    return this.commentsService.getCommentsForPost(id);
  }
}
