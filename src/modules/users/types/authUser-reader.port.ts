import { AuthUserModel } from './users.type';

export interface AuthUserReaderPort {
  getUserByEmail(email: string): Promise<AuthUserModel | null>;
  getUserById(id: number): Promise<AuthUserModel | null>;
}
