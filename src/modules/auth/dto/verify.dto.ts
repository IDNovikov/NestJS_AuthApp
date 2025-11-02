import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class VerifyDto {
  @ApiProperty() @IsInt() id!: number;
  @ApiProperty({ minLength: 6, maxLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  congfirmedCode!: string;
}
