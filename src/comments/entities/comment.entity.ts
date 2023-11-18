import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from 'src/posts/entities/post.entity'; // Укажите путь соответственно вашей структуре проекта
import { CommentLike } from './comment-like.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  body: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  post: Post;

  // @ManyToOne(() => Comment, (comment) => comment.replies, {
  //   onDelete: 'CASCADE',
  // })
  // parentComment: Comment;

  // @OneToMany(() => Comment, (comment) => comment.parentComment)
  // replies: Comment[];

  @OneToMany(() => CommentLike, (commentLike) => commentLike.comment, {
    onDelete: 'CASCADE',
  })
  likes: CommentLike[];

  // @Column({ default: 0 })
  // reppliesCount: number;
}
