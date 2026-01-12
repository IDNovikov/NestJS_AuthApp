//TODO: Меняем сущность в бд id = string

export enum UserRoles {
  'ADMIN',
  'USER',
}
export enum UserStatus {
  'ACTIVE',
  'BANNED',
  'DELETED',
}

export interface IUser {
  id: string;
  userName: string;
  email: string;
  isEmailVerified: boolean;
  telegramId: string | null;
  role: UserRoles;
  status: UserStatus;
  password: string;
  userImage: string | null;
  createdAt: string;
  updatedAt: string;
}
