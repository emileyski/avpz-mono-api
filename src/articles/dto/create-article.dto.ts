import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({
    description: 'The title of the article',
    type: String,
    example: 'How to create a NestJS app',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The body of the article',
    type: String,
    example: 'This is the body of the article',
  })
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiProperty({
    description: 'The tags of the article',
    type: [String],
    example: ['nestjs', 'javascript'],
  })
  @IsOptional()
  tags?: string[];
}
