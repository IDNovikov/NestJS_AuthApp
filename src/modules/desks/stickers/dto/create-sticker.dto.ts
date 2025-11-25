import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStickerDto {
  s;
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsInt()
  x!: number;

  @IsInt()
  y!: number;

  @IsString()
  @IsOptional()
  color?: string;
}
