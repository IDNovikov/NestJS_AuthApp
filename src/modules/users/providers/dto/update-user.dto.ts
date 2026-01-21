import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';

export class UpdateUserDTO {
  @IsEmail() email!: string;
  @IsNotEmpty() @MinLength(6) password!: string;
  @IsNotEmpty() @MinLength(3) userName!: string;
  @IsEnum(['ACTIVE', 'BANNED', 'DELETED']) status?:
    | 'ACTIVE'
    | 'BANNED'
    | 'DELETED';
  @IsEnum(['ADMIN', 'USER']) role?: 'ADMIN' | 'USER';
  @IsOptional() telegramId?: string;
  @IsOptional() refreshToken?: string | null;
  @IsOptional() isEmailVerified: boolean;
  @IsOptional() userImage?: string;
}

export type IUpdateUserDto = InstanceType<typeof UpdateUserDTO>;
