import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/articles/entities/article.entity';
import { MailService } from 'src/mail/mail.service';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminPanelService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    private mailService: MailService,
  ) {}

  async getAllUsers(name?: string, nickname?: string): Promise<any[]> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.name', 'user.nickname', 'user.email']);

    if (name) {
      queryBuilder.andWhere('user.name ILIKE :name', { name: `%${name}%` });
    }

    if (nickname) {
      queryBuilder.andWhere('user.nickname ILIKE :nickname', {
        nickname: `%${nickname}%`,
      });
    }

    return await queryBuilder.getRawMany();
  }

  async getOneUser(id: string): Promise<User> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async updateUser(id: string, user: User): Promise<User> {
    const userToUpdate = await this.usersRepository.findOne({ where: { id } });
    return await this.usersRepository.save({ ...userToUpdate, ...user });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const deleteResult = await this.usersRepository.delete({ id });

    if (!deleteResult.affected) {
      throw new NotFoundException('User not found');
    }

    return { message: `User with id ${id} was deleted` };
  }

  async deleteArticle(
    id: string,
    reason?: string,
  ): Promise<{ message: string }> {
    const article = await this.articlesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (reason) {
      this.mailService.sendEmail(
        article.user.email,
        'Article deleted',
        `Your article 
        (${article.title})
        was deleted because of ${reason}`,
      );
    }

    await this.articlesRepository.delete({ id });

    return { message: `Article with id ${id} was deleted` };
  }

  async deletePost(id: string, reason?: string): Promise<{ message: string }> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (reason) {
      this.mailService.sendEmail(
        post.user.email,
        'Post deleted',
        `Your post (${post.title}) was deleted because of ${reason}`,
      );
    }

    await this.postsRepository.delete({ id });

    return { message: `Post with id ${id} was deleted` };
  }
}
