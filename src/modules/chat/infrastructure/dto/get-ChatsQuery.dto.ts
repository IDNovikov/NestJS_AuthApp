import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetChatsQueryDto {
  @ApiPropertyOptional({
    example: 20,
    description: 'Limit of chats per page',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'Cursor for pagination (last chat id:number)',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  cursor?: number;
}
