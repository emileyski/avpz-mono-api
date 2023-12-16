import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { ForumMembership } from './entities/forum-membership.entity';
import { Repository } from 'typeorm';
import { Forum } from './entities/forum.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ForumMessage } from './entities/forum-message.entity';
import { CreateForumMessageDto } from './dto/create-forum-message-dto';
import { UserService } from 'src/user/user.service';
import { ForumMemberRole } from 'src/core/enums/forum-member-role.enum';
import { UpdateForumMessageDto } from './dto/update-forum-message-dto';
import { ForumAccessTypes } from 'src/core/enums/forum-access-types.enum';
import { SetForumRoleDto } from './dto/set-forum-role.dto';

@Injectable()
export class ForumService {
  constructor(
    @InjectRepository(Forum)
    private forumRepository: Repository<Forum>,
    @InjectRepository(ForumMembership)
    private forumMembershipRepository: Repository<ForumMembership>,
    @InjectRepository(ForumMessage)
    private forumMessageRepository: Repository<ForumMessage>,
    private readonly userService: UserService,
  ) {}

  async create(createForumDto: CreateForumDto, userId: string) {
    const forum = this.forumRepository.create(createForumDto);
    await this.forumRepository.save(forum);
    const membership = this.forumMembershipRepository.create({
      user: { id: userId },
      forum,
      role: ForumMemberRole.Admin,
    });
    await this.forumMembershipRepository.save(membership);

    return forum;
  }

  async join(id: string, userId: string) {
    console.log(id, userId);
    const forum = await this.forumRepository.findOne({
      where: { id },
      relations: ['memberships', 'memberships.user'],
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    const existingMembership = forum.memberships.find(
      (membership) => membership.user.id === userId,
    );

    //TODO: возможно стоит просто вернуть 200 и дто форума, если пользователь уже является участником форума
    if (existingMembership) {
      throw new ConflictException('You are already a member of this forum');
    }

    const membership = this.forumMembershipRepository.create({
      user: { id: userId },
      role: ForumMemberRole.Member,
      forum,
    });
    await this.forumMembershipRepository.save(membership);

    return {
      id: forum.id,
      theme: forum.theme,
      description: forum.description,
      createdAt: forum.createdAt,
      accessType: forum.accessType,
      membership: [...forum.memberships, membership].map((membership) => ({
        id: membership.id,
        role: membership.role,
        connectedAt: membership.connectedAt,
        user: this.userService.removeCredentials(membership.user),
      })),
    };
  }

  async createMessage(
    data: CreateForumMessageDto,
    userId: string,
  ): Promise<{
    message: ForumMessage;
    forumMemberIds: string[];
  }> {
    const userIsForumMember = await this.forumMembershipRepository.findOne({
      where: { user: { id: userId }, forum: { id: data.forumId } },
    });

    if (!userIsForumMember) {
      throw new NotFoundException('You are not a member of this forum');
    }

    const forumMessage = this.forumMessageRepository.create({
      text: data.text,
      user: { id: userId },
      forum: { id: data.forumId },
    });

    await this.forumMessageRepository.save(forumMessage);

    const forumMemberIds = (
      await this.forumMembershipRepository.find({
        where: { forum: { id: data.forumId } },
        relations: ['user'],
      })
    ).map((membership) => membership.user.id);

    return { message: forumMessage, forumMemberIds };
  }

  async updateMessage(
    data: UpdateForumMessageDto,
    userId: string,
  ): Promise<{ message: ForumMessage; forumMemberIds: string[] }> {
    const forumMessage = await this.forumMessageRepository.findOne({
      where: { id: data.messageId, user: { id: userId } },
      relations: [
        'user',
        'forum',
        // 'forum.memberships',
        // 'forum.memberships.user',
      ],
    });

    if (!forumMessage || forumMessage.user.id !== userId) {
      throw new NotFoundException(
        'Message not found or you are not the author',
      );
    }

    forumMessage.text = data.text;
    await this.forumMessageRepository.save(forumMessage);

    const forumMemberIds = (
      await this.forumMembershipRepository.find({
        where: { forum: { id: forumMessage.forum.id } },
        relations: ['user'],
      })
    ).map((membership) => membership.user.id);

    return {
      message: {
        id: forumMessage.id,
        text: forumMessage.text,
        createdAt: forumMessage.createdAt,
        user: this.userService.removeCredentials(forumMessage.user),
        forum: forumMessage.forum,
      },
      forumMemberIds,
    };
  }

  async deleteMessage(
    messageId: string,
    userId: string,
  ): Promise<{ message: ForumMessage; forumMemberIds: string[] }> {
    const forumMessage = await this.forumMessageRepository.findOne({
      where: { id: messageId, user: { id: userId } },
      relations: ['user', 'forum'],
    });

    if (!forumMessage || forumMessage.user.id !== userId) {
      throw new NotFoundException(
        'Message not found or you are not the author',
      );
    }

    const forumMemberIds = (
      await this.forumMembershipRepository.find({
        where: { forum: { id: forumMessage.forum.id } },
        relations: ['user'],
      })
    ).map((membership) => membership.user.id);

    await this.forumMessageRepository.remove(forumMessage);

    return { message: forumMessage, forumMemberIds };
  }

  async findAll() {
    const forums = await this.forumRepository.find({
      relations: [
        'memberships',
        'memberships.user',
        'messages',
        'messages.user',
      ],
      where: { accessType: ForumAccessTypes.PUBLIC },
    });

    return forums.map((forum) => ({
      id: forum.id,
      theme: forum.theme,
      description: forum.description,
      createdAt: forum.createdAt,
      accessType: forum.accessType,
      membership: forum.memberships.map((membership) => ({
        id: membership.id,
        role: membership.role,
        connectedAt: membership.connectedAt,
        user: this.userService.removeCredentials(membership.user),
      })),
      messages: forum.messages.map((message) => ({
        id: message.id,
        text: message.text,
        createdAt: message.createdAt,
        user: this.userService.removeCredentials(message.user),
      })),
    }));
  }

  async setForumRole(
    userId: string,
    setForumRoleDto: SetForumRoleDto,
  ): Promise<ForumMembership> {
    const { forumId, selectedUserId, role } = setForumRoleDto;

    const forum = await this.forumRepository.findOne({
      where: { id: forumId },
      relations: ['memberships'],
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    const membership = forum.memberships.find(
      (membership) => membership.user.id === userId,
    );

    if (!membership) {
      throw new NotFoundException('You are not a member of this forum');
    }

    if (membership.role !== ForumMemberRole.Admin) {
      throw new ConflictException('You are not an admin of this forum');
    }

    const selectedUserMembership = forum.memberships.find(
      (membership) => membership.user.id === selectedUserId,
    );

    if (!selectedUserMembership) {
      throw new NotFoundException('User not found');
    }

    selectedUserMembership.role = role;
    await this.forumMembershipRepository.save(selectedUserMembership);

    return selectedUserMembership;
  }
  findOne(id: number) {
    return `This action returns a #${id} forum`;
  }

  async update(id: string, userId: string, updateForumDto: UpdateForumDto) {
    const forum = await this.forumRepository.findOne({
      where: { id },
      relations: ['memberships', 'memberships.user'],
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    const membership = forum.memberships.find(
      (membership) => membership.user.id === userId,
    );

    if (!membership || membership.role !== ForumMemberRole.Admin) {
      throw new NotFoundException(
        'You are not a member of this forum or you are not an admin',
      );
    }

    await this.forumRepository.merge(forum, updateForumDto);
    await this.forumRepository.save(forum);

    const updatedForum = await this.forumRepository.findOne({
      where: { id },
      relations: ['memberships'],
    });

    return updatedForum;
  }

  async remove(id: string, userId: string) {
    const forum = await this.forumRepository.findOne({
      where: { id },
      relations: ['memberships', 'memberships.user'],
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    const membership = forum.memberships.find(
      (membership) => membership.user.id === userId,
    );

    if (!membership || membership.role !== ForumMemberRole.Admin) {
      throw new NotFoundException(
        'You are not a member of this forum or you are not an admin',
      );
    }

    await this.forumRepository.remove(forum);

    return { message: `Forum ${id} has been deleted` };
  }
}
