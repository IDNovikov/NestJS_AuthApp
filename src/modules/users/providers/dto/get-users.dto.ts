import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GetUsersDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsPositive()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsPositive()
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy: 'createdAt' | 'email' | 'userName' = 'createdAt';

  @IsOptional()
  @IsString()
  order: 'asc' | 'desc' = 'desc';
  @IsOptional() @IsString() search?: string;
}
