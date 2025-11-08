import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class VerifyDto {
  @ApiProperty() @IsEmail() email!: string;

  @ApiProperty({ minLength: 6, maxLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  congfirmedCode!: string;
}
