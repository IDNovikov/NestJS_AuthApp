import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ChatUserDTO } from './chatUser.dto';

export class CreateChatDTO {
  @ApiPropertyOptional({
    example: 'Backend team',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  name: string | null;

  @ApiProperty({
    type: [ChatUserDTO],
    description: 'Chat members',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatUserDTO)
  members: ChatUserDTO[];
}
