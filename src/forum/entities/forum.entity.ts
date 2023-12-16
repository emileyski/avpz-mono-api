import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ForumMembership } from './forum-membership.entity';
import { ForumMessage } from './forum-message.entity';
import { ForumAccessTypes } from 'src/core/enums/forum-access-types.enum';

@Entity()
export class Forum {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  theme: string;

  @Column({ nullable: false })
  description: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: ForumAccessTypes,
    default: ForumAccessTypes.PUBLIC,
  })
  accessType: ForumAccessTypes;

  @OneToMany(() => ForumMembership, (membership) => membership.forum, {
    onDelete: 'CASCADE',
  })
  memberships: ForumMembership[];

  @OneToMany(() => ForumMessage, (message) => message.forum, {
    onDelete: 'CASCADE',
  })
  messages: ForumMessage[];
}
