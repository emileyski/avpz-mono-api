import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Repository } from 'typeorm';
import { ArticleComment } from './entities/article-comment.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(ArticleComment)
    private readonly articleCommentRepository: Repository<ArticleComment>,
  ) {}

  // Assuming this method is part of your ArticleService or similar class

  create(createArticleDto: CreateArticleDto, userId: string) {
    console.log(createArticleDto.tags);

    const article = this.articleRepository.create({
      ...createArticleDto,
      user: { id: userId },
    });

    // Assign the tags array directly, no need for JSON.stringify
    article.tags = createArticleDto.tags;

    return this.articleRepository.save(article);
  }

  async findAll() {
    // return this.articleRepository.find();
    const articles = await this.articleRepository
      .createQueryBuilder('article')
      .select([
        'article.id',
        'article.title',
        'article.body',
        'article.tags',
        'article.createdAt',
        'user.name',
        'user.nickname',
        'user.id',
        'comments.id',
        'comments.body',
        'comments.createdAt',
        'commentUser.id',
        'commentUser.name',
        'commentUser.nickname',
      ])
      .leftJoin('article.user', 'user')
      .leftJoin('article.comments', 'comments')
      .leftJoin('comments.user', 'commentUser')
      .getMany();

    return articles;
  }

  async findOne(id: string) {
    const article = await this.articleRepository
      .createQueryBuilder('article')
      .select([
        'article.id',
        'article.title',
        'article.body',
        'article.tags',
        'article.createdAt',
        'user.name',
        'user.nickname',
        'user.id',
        'comments.id',
        'comments.body',
        'comments.createdAt',
        'commentUser.id',
        'commentUser.name',
        'commentUser.nickname',
      ])
      .leftJoin('article.user', 'user')
      .leftJoin('article.comments', 'comments')
      .leftJoin('comments.user', 'commentUser')
      .where('article.id = :id', { id })
      .getOne();

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  //TODO: Implement update method
  async update(id: string, updateArticleDto: UpdateArticleDto) {
    const article = await this.articleRepository.findOne({ where: { id } });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const updatedArticle = await this.articleRepository.save({
      ...article,
      ...updateArticleDto,
    });

    return updatedArticle;
  }

  async remove(id: string, userId: string) {
    const removeResult = await this.articleRepository.delete({
      id,
      user: { id: userId },
    });

    if (!removeResult.affected) {
      throw new NotFoundException('Article not found or you are not the owner');
    }

    return { message: `Article with id ${id} was deleted` };
  }

  async like(id: string, userId: string) {
    // const article = await this.articleRepository.findOne({
    //   where: { id },
    //   relations: ['likes'],
    // });
  }

  async comment(id: string, body: string, userId: string) {
    const article = await this.articleRepository.findOne({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const comment = await this.articleCommentRepository.save({
      body,
      user: { id: userId },
      // article,
    });

    return comment;
  }

  async removeComment(commentId: string, userId: string) {
    const removeResult = await this.articleCommentRepository.delete({
      id: commentId,
      user: { id: userId },
    });

    if (!removeResult.affected) {
      throw new NotFoundException('Comment not found or you are not the owner');
    }

    return { message: `Comment with id ${commentId} was deleted` };
  }
}
