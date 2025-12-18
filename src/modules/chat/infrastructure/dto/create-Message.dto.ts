import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateMessageDTO {
  @ApiProperty({
    example: 'Hello buddies',
  })
  @IsString()
  text: string;
}
