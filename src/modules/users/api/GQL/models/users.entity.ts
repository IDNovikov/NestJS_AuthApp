import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'user123' })
  userName!: string;

  @ApiProperty({ example: '123456789', required: false, nullable: true })
  telegramId?: string | null;

  @ApiProperty({ example: 'adawdad.jpg', required: false, nullable: true })
  userImage?: string | null;

  @ApiProperty({ enum: ['USER', 'ADMIN'], example: 'USER' })
  role!: 'USER' | 'ADMIN';

  @ApiProperty({ enum: ['ACTIVE', 'BANNED', 'DELETED'], example: 'ACTIVE' })
  status!: 'ACTIVE' | 'BANNED' | 'DELETED';

  @ApiProperty({ example: '2025-10-20T10:23:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-10-20T10:23:00.000Z' })
  updatedAt!: Date;
}
