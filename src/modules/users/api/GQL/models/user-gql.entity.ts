import {
  ObjectType,
  Field,
  Int,
  registerEnumType,

} from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  DELETED = 'DELETED',
}

registerEnumType(UserRole, { name: 'UserRole' });
registerEnumType(UserStatus, { name: 'UserStatus' });

@ObjectType()
export class UserGqlEntity {

  @ApiProperty({ example: 1 })
  @Field(() => Int, { description: 'User ID (number)' })
  id!: number;

   @ApiProperty({ example: 'user@example.com' })
  @Field({ description: 'User email (string)' })
  email!: string;

  @ApiProperty({ example: 'user123' })
  @Field({ description: 'User name (string)' })
  userName!: string;

  @ApiProperty({ example: '123456789', required: false, nullable: true })
  @Field(() => String, { nullable: true, description: 'Telegram ID(string)' })
  telegramId?: string | null;

  @ApiProperty({ example: 'adawdad.jpg', required: false, nullable: true })
  @Field(() => String, { nullable: true, description: 'Image (link S3)' })
  userImage!: string | null;

  @ApiProperty({ enum: ['USER', 'ADMIN'], example: 'USER' })
  @Field(() => UserRole, { description: 'User role (ENUM)' })
  role!: UserRole;

    @ApiProperty({ enum: ['ACTIVE', 'BANNED', 'DELETED'], example: 'ACTIVE' })
  @Field(() => UserStatus, { description: 'User status (ENUM)' })
  status!: UserStatus;

  @ApiProperty({ example: '2025-10-20T10:23:00.000Z' })
  @Field(() => Date, { description: 'Created (Date obj)' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-10-20T10:23:00.000Z' })
  @Field(() => Date, { description: 'Updated (Date obj)' })
  updatedAt!: Date;
}
