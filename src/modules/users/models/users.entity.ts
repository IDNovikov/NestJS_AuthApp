import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() userName!: string;
  @ApiProperty() telegramId?: string | null;
  @ApiProperty() role!: 'USER' | 'ADMIN';
  @ApiProperty() status!: 'ACTIVE' | 'BANNED' | 'DELETED';
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
