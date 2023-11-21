import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'The nickname of the user',
    example: 'johndoe',
    required: false,
  })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({
    description: 'The birth date of the user',
    example: '2000-01-01',
    required: false,
  })
  @IsString()
  @IsOptional()
  birthDate?: Date;

  @ApiProperty({
    description: 'The bio of the user',
    example: 'I am a software engineer',
    required: false,
  })
  @IsOptional()
  @IsString()
  about?: string;
}
