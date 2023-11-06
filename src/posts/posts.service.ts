import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
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
        (file) => `http://localhost:3000/api/files/${file.id}`,
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
      ])
      .leftJoin('post.user', 'user') // Join the user relation
      .getMany();

    posts.forEach((post) => {
      console.log(post.pictures);
      post.pictures = post.pictures.map(
        //TODO: Change this to a better way to get the url
        (picture) => `http://localhost:3000/api/files/${picture}`,
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
        'commentUser.id', // Добавляем id комментатора
        'commentUser.name', // Добавляем имя комментатора
      ])
      .leftJoin('post.user', 'user')
      .leftJoinAndSelect('post.comments', 'comment')
      .leftJoin('comment.user', 'commentUser') // Добавляем юзера для комментария
      .where('post.id = :id', { id })
      .getOne();

    if (!post) throw new NotFoundException('Post not found');

    post.pictures = post.pictures.map(
      (picture) => `http://localhost:3000/api/files/${picture}`,
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
}
