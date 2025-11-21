import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';
import { LoginDto } from '../../auth/dto/login.dto';

export class RegistrateDto extends LoginDto {
  @ApiProperty({ minLength: 3 }) @IsNotEmpty() @MinLength(3) userName!: string;
}
