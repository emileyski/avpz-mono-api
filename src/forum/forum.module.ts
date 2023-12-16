import { Module } from '@nestjs/common';
import { ForumService } from './forum.service';
import { ForumController } from './forum.controller';
import { ForumMembership } from './entities/forum-membership.entity';
import { Forum } from './entities/forum.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumGateway } from './forum.gateway';
import { ForumMessage } from './entities/forum-message.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Forum, ForumMembership, ForumMessage]),
    UserModule,
  ],
  controllers: [ForumController],
  providers: [ForumService, ForumGateway],
})
export class ForumModule {}
