import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class EditMessageDTOO {
  @ApiProperty({
    example: 'cab9848a-5ab2-4fff-800a-5150b0435873',
  })
  @IsString()
  messageId!: string;

  @ApiProperty({
    example: 'Some text',
  })
  @IsString()
  newText!: string;
}
