import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class ChatUserDTO {
  @ApiProperty({ example: 2 })
  @IsInt()
  id: number;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  userName: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/user.png',
  })
  @IsOptional()
  @IsString()
  userImage: string | null;
}
