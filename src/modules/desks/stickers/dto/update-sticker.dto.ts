import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateStickerDto {
  @IsString()
  @IsNotEmpty()
  text?: string;

  @IsInt()
  x?: number;

  @IsInt()
  y?: number;

  @IsInt()
  layer?: number;

  @IsString()
  @IsOptional()
  color?: string;
}
