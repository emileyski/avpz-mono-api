import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateForumDto {
  @ApiProperty({
    description: 'Forum name',
    example: 'My Forum',
  })
  @IsNotEmpty()
  @IsString()
  theme: string;

  @ApiProperty({
    description: 'Forum description',
    example: 'This is my forum',
  })
  @IsNotEmpty()
  @IsString()
  description: string;
}
