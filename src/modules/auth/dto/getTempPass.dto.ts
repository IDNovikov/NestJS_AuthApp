import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class GetTempPassDto {
  @ApiProperty() @IsEmail() email!: string;
}
