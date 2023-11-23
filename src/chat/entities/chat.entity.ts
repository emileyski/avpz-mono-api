import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChatUser } from './chat-user.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @OneToMany(() => ChatUser, (chatUser) => chatUser.chat, {
    onDelete: 'CASCADE',
  })
  chatUsers: ChatUser[];
}
