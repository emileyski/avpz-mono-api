import { ApiProperty } from '@nestjs/swagger';
import { ForumMemberRole } from 'src/core/enums/forum-member-role.enum';
import { IsNotEmpty, IsString } from 'class-validator';

export class SetForumRoleDto {
  @ApiProperty({
    description: 'Forum id',
    example: 'f7c8c6d2-3c8a-4b5f-8f6e-6b3e1e9b7e0e',
  })
  @IsNotEmpty()
  @IsString()
  forumId: string;

  @ApiProperty({
    description: 'Selected user id',
    example: 'f7c8c6d2-3c8a-4b5f-8f6e-6b3e1e9b7e0e',
  })
  @IsNotEmpty()
  @IsString()
  selectedUserId: string;

  @ApiProperty({
    description: 'Role of the user',
    example: ForumMemberRole.Admin,
  })
  @IsNotEmpty()
  role: ForumMemberRole;
}
