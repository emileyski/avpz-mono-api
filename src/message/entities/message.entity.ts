import { ChatUser } from 'src/chat/entities/chat-user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt?: Date;

  @ManyToOne(() => ChatUser, (chatUser) => chatUser.messages, {
    onDelete: 'CASCADE',
  })
  chatUser: ChatUser;
}
