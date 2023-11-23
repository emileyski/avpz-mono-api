import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Chat } from './chat.entity';
import { User } from 'src/user/entities/user.entity';
import { Message } from 'src/message/entities/message.entity';

@Entity()
export class ChatUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Chat, (chat) => chat.chatUsers, { onDelete: 'CASCADE' })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.chatUsers, { onDelete: 'CASCADE' })
  user: User;

  @Column({ default: new Date() })
  createdAt: Date;

  @OneToMany(() => Message, (message) => message.chatUser, {
    onDelete: 'CASCADE',
  })
  messages: Message[];
}
