import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UserQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
  @ApiPropertyOptional({
    enum: ['createdAt', 'email', 'userName'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy: 'createdAt' | 'email' | 'userName' = 'createdAt';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  order: 'asc' | 'desc' = 'desc';
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
}
