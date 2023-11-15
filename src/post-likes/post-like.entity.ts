import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => User, (user) => user.postLikes, { onDelete: 'CASCADE' })
  user: User;
}
