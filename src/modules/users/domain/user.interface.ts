//TODO: Меняем сущность в бд id = string

import { $Enums, User } from '@prisma/client';

export enum UserRoles {
  'ADMIN',
  'USER',
}
export enum UserStatus {
  'ACTIVE',
  'BANNED',
  'DELETED',
}

export interface IUser extends User {
  id: number;
  userName: string;
  email: string;
  isEmailVerified: boolean;
  telegramId: string | null;
  role: $Enums.userRoles;
  status: $Enums.userStatus;
  password: string;
  userImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}
