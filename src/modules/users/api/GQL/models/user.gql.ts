import {
  ObjectType,
  Field,
  Int,
  registerEnumType,
  InputType,
} from '@nestjs/graphql';
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
  @Field(() => Int, { description: 'User ID (number)' })
  id!: number;

  @Field({ description: 'User email (string)' })
  email!: string;

  @Field({ description: 'User name (string)' })
  userName!: string;

  @Field(() => String, { nullable: true, description: 'Telegram ID(string)' })
  telegramId?: string | null;

  @Field(() => String, { nullable: true, description: 'Image (link S3)' })
  userImage!: string | null;

  @Field(() => UserRole, { description: 'User role (ENUM)' })
  role!: UserRole;

  @Field(() => UserStatus, { description: 'User status (ENUM)' })
  status!: UserStatus;

  @Field(() => Date, { description: 'Created (Date obj)' })
  createdAt!: Date;

  @Field(() => Date, { description: 'Updated (Date obj)' })
  updatedAt!: Date;
}

@InputType()
export class CreateUserInput {
  @Field() @IsEmail() email!: string;
  @Field() @IsNotEmpty() @MinLength(6) password!: string;
  @Field() @IsNotEmpty() @MinLength(3) userName!: string;
}
