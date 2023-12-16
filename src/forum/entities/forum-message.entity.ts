import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Forum } from './forum.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class ForumMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @ManyToOne(() => Forum, (forum) => forum.messages, {
    onDelete: 'CASCADE',
  })
  forum: Forum;

  @ManyToOne(() => User, (user) => user.forumMessages, {
    onDelete: 'CASCADE',
  })
  user: User;
}
