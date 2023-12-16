import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateForumMessageDto {
  @ApiProperty({
    description: 'Text of the message',
    example: 'Hello, world!',
  })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Id of the forum',
    example: 'f7c8c6d2-3c8a-4b5f-8f6e-6b3e1e9b7e0e',
  })
  @IsNotEmpty()
  @IsString()
  forumId: string;
}
