import { Genders } from 'src/core/enums/gender.enum';
import { Roles } from 'src/core/enums/roles.enum';
import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from 'src/comments/entities/comment.entity'; // Adjust the path accordingly
import { Article } from 'src/articles/entities/article.entity';
import { PostLike } from 'src/post-likes/post-like.entity';
import { CommentLike } from 'src/comments/entities/comment-like.entity';
import { StrategyTypes } from 'src/core/enums/strategy.enum';
import { Chat } from 'src/chat/entities/chat.entity';
import { ChatUser } from 'src/chat/entities/chat-user.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_EMAIL', { unique: true })
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ default: Roles.USER })
  role: Roles;

  @Column({ nullable: true })
  birthDate?: Date;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ nullable: true })
  about?: string;

  @Index('IDX_NICKNAME', { unique: true })
  @Column()
  nickname: string;

  @Column({ default: Genders.OTHER })
  gender: Genders;

  @Index('IDX_TOKEN')
  @Column({ nullable: true })
  token?: string;

  @OneToMany(() => Post, (post) => post.user, { onDelete: 'CASCADE' })
  posts: Post[];

  @OneToMany(() => Article, (article) => article.user)
  articles: Article[];

  @Column({ nullable: true })
  picture?: string;

  @OneToMany(() => Comment, (comment) => comment.user, { onDelete: 'CASCADE' })
  comments: Comment[];

  @OneToMany(() => PostLike, (postLike) => postLike.user, {
    onDelete: 'CASCADE',
  })
  postLikes: PostLike[];

  @OneToMany(() => CommentLike, (commentLike) => commentLike.user, {
    onDelete: 'CASCADE',
  })
  commentLikes: CommentLike[];

  @Column({ default: StrategyTypes.LOCAL })
  strategy: StrategyTypes;

  // @OneToMany(() => Chat, (chat) => chat.users)
  // chats: Chat[];

  @OneToMany(() => ChatUser, (chatUser) => chatUser.user)
  chatUsers: ChatUser[];
}
