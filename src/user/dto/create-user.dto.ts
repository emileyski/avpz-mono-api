// import { ApiProperty } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Roles } from 'src/core/enums/roles.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'example@example.com',
  })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({ description: 'The name of the user', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The password of the user', example: 'password' })
  @IsString()
  @Length(8, 20)
  password: string;

  @ApiProperty({
    description: 'The nickname of the user',
    example: 'johndoe',
  })
  @IsString()
  nickname: string;

  @ApiProperty({
    description: 'The birth date of the user',
    example: '2000-01-01',
  })
  @IsString()
  birthDate: Date;

  @ApiProperty({ description: 'The role of the user', example: 'customer' })
  @IsOptional()
  @IsEnum(Roles)
  role?: Roles;
}
