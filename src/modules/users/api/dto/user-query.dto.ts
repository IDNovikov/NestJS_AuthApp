import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
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

enum sortBy {
  createdAt = 'createdAt',
  email = 'email',
  userName = 'userName',
}
registerEnumType(sortBy, {
  name: 'SortBy',
  description: 'Sorting fields',
});

enum order {
  asc = 'asc',
  desc = 'desc',
}
registerEnumType(order, {
  name: 'order',
  description: 'Sorting fields',
});

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

  @Field(() => sortBy, { nullable: true })
  @ApiPropertyOptional({
    enum: ['createdAt', 'email', 'userName'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy: 'createdAt' | 'email' | 'userName' = 'createdAt';

  @Field(() => order, { nullable: true })
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
