import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { FilesService } from 'src/files/files.service';
import { PostLike } from 'src/post-likes/post-like.entity';

@Injectable()
export class PostsService {
  API_URL: string = process.env.API_URL || 'http://localhost:3000';

  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private postLikesRepository: Repository<PostLike>,
    private readonly filesService: FilesService,
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

  async findAll() {
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
        'comments.id',
        'comments.body',
        'comments.createdAt',
        'commentUser.id',
        'commentUser.name',
      ])
      .leftJoin('post.user', 'user')
      .leftJoin('post.comments', 'comments')
      .leftJoin('comments.user', 'commentUser') // Join the comments.user relation
      .getMany();

    posts.forEach((post) => {
      post.pictures = post.pictures.map(
        (picture) => `${this.API_URL}/api/files/${picture}`,
      );
    });

    return posts;
  }

  async findOne(id: string) {
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
      .leftJoin('post.user', 'user')
      .leftJoinAndSelect('post.comments', 'comment')
      .leftJoin('comment.user', 'commentUser') // Добавляем юзера для комментария
      .where('post.id = :id', { id })
      .getOne();

    if (!post) throw new NotFoundException('Post not found');

    post.pictures = post.pictures.map(
      (picture) => `${this.API_URL}/api/files/${picture}`,
    );

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
      return { message: `Like to post ${id} removed successfully` };
    }

    const like = this.postLikesRepository.create({
      post: { id },
      user: { id: userId },
    });

    await this.postLikesRepository.save(like);

    return { message: `Like to post ${id} added successfully` };
  }
}
