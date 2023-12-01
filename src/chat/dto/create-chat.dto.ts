import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({
    description: 'Chat name',
    example: 'Chat name',
    type: String,
    required: false,
  })
  chatName?: string;

  @ApiProperty({
    description: 'Interlocutor id',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  interlocutorId: string;
}
