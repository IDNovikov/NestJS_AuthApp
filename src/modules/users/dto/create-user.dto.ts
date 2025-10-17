import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty({ minLength: 6 }) @IsNotEmpty() @MinLength(6) password!: string;
  @ApiProperty({ minLength: 3 }) @IsNotEmpty() @MinLength(3) userName!: string;
}
