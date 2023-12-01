import { Message } from 'src/message/entities/message.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChatMember } from './chat-member.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @OneToMany(() => Message, (message) => message.chat, { onDelete: 'CASCADE' })
  messages: Message[];

  @OneToMany(() => ChatMember, (chatMember) => chatMember.chat, {
    onDelete: 'CASCADE',
  })
  chatMembers: ChatMember[];
}
