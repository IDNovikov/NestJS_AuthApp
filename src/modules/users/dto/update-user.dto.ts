import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty() status!: 'ACTIVE' | 'BANNED' | 'DELETED';
  @ApiProperty() role!: 'ADMIN' | 'USER';
  @ApiPropertyOptional() @IsOptional() telegramId?: string;
  @ApiPropertyOptional() @IsOptional() userImage?: string;
}
