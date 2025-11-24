import { PrivateUserModel } from '../users.type';

export const UserReaderPort = Symbol('UserReaderPort');
export interface IUserReaderPort {
  getUserByEmail(email: string): Promise<PrivateUserModel | null>;
  getUserById(id: number): Promise<PrivateUserModel | null>;
}
