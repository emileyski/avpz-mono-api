import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from 'src/comments/entities/comment.entity'; // Укажите путь соответственно вашей структуре проекта

@Entity()
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.commentLikes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.likes, { onDelete: 'CASCADE' })
  comment: Comment;

  @Column({ default: new Date() })
  createdAt: Date;
}
