import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEnum(['ACTIVE', 'BANNED', 'DELETED']) @ApiProperty() status?:
    | 'ACTIVE'
    | 'BANNED'
    | 'DELETED';
  @IsEnum(['ADMIN', 'USER']) @ApiProperty() role?: 'ADMIN' | 'USER';
  @ApiPropertyOptional() @IsOptional() telegramId?: string;
  @ApiProperty() @IsOptional() refreshToken?: string | null;
  @ApiProperty() @IsOptional() isEmailVerified: boolean;
  @ApiPropertyOptional() @IsOptional() userImage?: string;
  @ApiPropertyOptional() @IsOptional() userName?: string;
}

export type IUpdateUserDto = InstanceType<typeof UpdateUserDto>;
