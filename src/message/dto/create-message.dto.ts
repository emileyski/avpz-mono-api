import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Message text',
    example: 'Hello',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Chat id',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  chatId: string;
}
