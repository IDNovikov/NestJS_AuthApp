import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDeskDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}
