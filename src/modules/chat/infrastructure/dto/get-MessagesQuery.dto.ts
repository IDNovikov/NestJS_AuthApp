import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetMessagesQueryDto {
  @ApiPropertyOptional({
    example: 20,
    description: 'Limit of messages per page',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    example: 'f3922e51-da1e-4746-9861-72fabfea9f3b',
    description: 'Cursor for pagination (last chat id:string UUID)',
  })
  @IsOptional()
  @IsString()
  cursor?: string;
}
