import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from 'src/comments/entities/comment.entity'; // Adjust the path accordingly

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_TITLE')
  @Column()
  title: string;

  @Column()
  body: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  pictures: string[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
