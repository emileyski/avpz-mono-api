import { IsString } from 'class-validator';
import { SignInDto } from './sign-in.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Genders } from 'src/core/enums/gender.enum';

export class SignUpDto extends SignInDto {
  @ApiProperty({ description: 'The name of the user', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The birth date of the user',
    example: '2000-01-01',
  })
  @IsString()
  birthDate: Date;

  @ApiProperty({
    description: 'The nickname of the user',
    example: 'johndoe',
  })
  nickname: string;

  @ApiProperty({
    description: 'The bio of the user',
    example: 'I love programming!',
  })
  about: string;

  @ApiProperty({
    description: 'The user gender',
    example: 'MALE',
  })
  gender: Genders;
}
