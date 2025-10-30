import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty() status!: 'ACTIVE' | 'BANNED' | 'DELETED';
  @ApiProperty() role!: 'ADMIN' | 'USER';
  @ApiPropertyOptional() @IsOptional() telegramId?: string;
  @ApiProperty() verifyEmail!: boolean;
  @ApiProperty() @IsOptional() emailVerifyCode?: string;
  @ApiProperty() @IsOptional() emailVerifyExpired?: Date;
  @ApiProperty() @IsOptional() refreshToken?: string | null;

  //Это открытые изменения, которые может делать юзер, так?
  @ApiPropertyOptional() @IsOptional() userImage?: string;
  @ApiPropertyOptional() @IsOptional() userName?: string;
}
