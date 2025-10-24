import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';
import { LoginDto } from './login.dto';

export class RegistrateDto extends PartialType(LoginDto) {
  @ApiProperty({ minLength: 3 }) @IsNotEmpty() @MinLength(3) userName!: string;
}
