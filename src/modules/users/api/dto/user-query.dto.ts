import { Field, InputType, Int } from '@nestjs/graphql';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

@InputType()
export class UserQueryDto {
  @Field(() => Int, { nullable: true })
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsPositive()
  page?: number;

  @Field(() => Int, { nullable: true })
  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsPositive()
  limit?: number;

  @Field({ nullable: true })
  @ApiPropertyOptional({
    enum: ['createdAt', 'email', 'userName'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy: 'createdAt' | 'email' | 'userName' = 'createdAt';

  @Field({ nullable: true })
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  order: 'asc' | 'desc' = 'desc';

  @Field({ nullable: true })
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
