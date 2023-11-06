import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
}
