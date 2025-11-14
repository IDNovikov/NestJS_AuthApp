import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteSessionDTO {
  @ApiProperty() @IsString() id!: string;
  @ApiProperty() @IsString() deviceId!: string;
}
