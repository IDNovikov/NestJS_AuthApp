import { PrivateUserModel } from './users.type';

export interface UserReaderPort {
  getUserByEmail(email: string): Promise<PrivateUserModel | null>;
  getUserById(id: number): Promise<PrivateUserModel | null>;
}
