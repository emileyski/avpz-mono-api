import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArticleComment } from './article-comment.entity';

@Entity()
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_ARTICLE_TITLE')
  @Column()
  title: string;

  @Column()
  body: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];

  @ManyToOne(() => User, (user) => user.articles, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => ArticleComment, (comment) => comment.article, {
    onDelete: 'CASCADE',
  })
  comments: ArticleComment[];
}
