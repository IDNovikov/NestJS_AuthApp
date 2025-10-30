import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty() @IsNotEmpty() @IsInt() id!: number;

  @ApiProperty({ minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  oldPassword!: string;
  @ApiProperty({ minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  newPassword!: string;
}
