import {
  ObjectType,
  Field,
  Int,
  registerEnumType,
  InputType,
} from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

// --- если хочешь добавить enum красиво:
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  DELETED = 'DELETED',
}

// обязательно регистрируем enum'ы в GraphQL:
registerEnumType(UserRole, { name: 'UserRole' });
registerEnumType(UserStatus, { name: 'UserStatus' });

@ObjectType()
export class UserGqlEntity {
  @Field(() => Int)
  id!: number;

  @Field()
  email!: string;

  @Field()
  userName!: string;

  @Field(() => String, { nullable: true })
  telegramId?: string | null;

  @Field(() => String, { nullable: true })
  userImage!: string | null;

  @Field(() => UserRole)
  role!: UserRole;

  @Field(() => UserStatus)
  status!: UserStatus;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}

@InputType()
export class CreateUserInput {
  @Field() @IsEmail() email!: string;
  @Field() @IsNotEmpty() @MinLength(6) password!: string;
  @Field() @IsNotEmpty() @MinLength(3) userName!: string;
}
