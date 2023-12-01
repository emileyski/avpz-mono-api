import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class ChatMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: new Date() })
  joinedAt: Date;

  @ManyToOne(() => Chat, (chat) => chat.chatMembers, { onDelete: 'CASCADE' })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.chatMemberships, {
    onDelete: 'CASCADE',
  })
  user: User;
}
