import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  oldPassword!: string;
  @ApiProperty({ minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  newPassword!: string;
}
