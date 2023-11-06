import { Roles } from 'src/core/enums/roles.enum';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_EMAIL', { unique: true })
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({ default: Roles.USER })
  role: Roles;

  @Column()
  birthDate: Date;

  @Column({ default: new Date() })
  createdAt: Date;

  @Index('IDX_TOKEN')
  @Column({ nullable: true })
  token?: string;
}
