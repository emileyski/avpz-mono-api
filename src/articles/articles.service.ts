import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
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
      ])
      .leftJoin('article.user', 'user')
      .getMany();

    return articles;
  }

  findOne(id: number) {
    return `This action returns a #${id} article`;
  }

  update(id: number, updateArticleDto: UpdateArticleDto) {
    return `This action updates a #${id} article`;
  }

  remove(id: number) {
    return `This action removes a #${id} article`;
  }
}
