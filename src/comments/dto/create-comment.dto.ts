import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'The body of the comment',
    example: 'Hello world!',
  })
  @IsString()
  @IsNotEmpty()
  body: string;
}
