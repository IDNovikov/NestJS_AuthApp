import { User } from '@prisma/client';

export type UserModel = User;

export type SafeUserModel = Omit<
  UserModel,
  'password' | 'email' | 'isEmailVerified' | 'telegramId' | 'role' | 'status'
>;
export type AuthUserModel = Omit<UserModel, 'userImage'>;
export type PublicProfileModel = Omit<
  UserModel,
  'password' | 'email' | 'telegramId'
>;
export type PrivateUserModel = Omit<UserModel, 'password'>;
