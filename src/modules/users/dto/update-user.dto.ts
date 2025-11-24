import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty() status?: 'ACTIVE' | 'BANNED' | 'DELETED';
  @ApiProperty() role?: 'ADMIN' | 'USER';
  @ApiPropertyOptional() @IsOptional() telegramId?: string;
  @ApiProperty() @IsOptional() refreshToken?: string | null;
  @ApiProperty() @IsOptional() isEmailVerified: boolean;
  @ApiPropertyOptional() @IsOptional() userImage?: string;
  @ApiPropertyOptional() @IsOptional() userName?: string;
}

export type IUpdateUserDto = InstanceType<typeof UpdateUserDto>;
