import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Forum } from './forum.entity';
import { Roles } from 'src/core/enums/roles.enum';
import { User } from 'src/user/entities/user.entity';
import { ForumMemberRole } from 'src/core/enums/forum-member-role.enum';

@Entity()
export class ForumMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Forum, (forum) => forum.memberships, {
    onDelete: 'CASCADE',
  })
  forum: Forum;

  @ManyToOne(() => User, (user) => user.forumMemberships, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({
    type: 'enum',
    enum: ForumMemberRole,
    default: ForumMemberRole.Member,
  })
  role: ForumMemberRole;

  @Column({ default: new Date() })
  connectedAt: Date;
}
