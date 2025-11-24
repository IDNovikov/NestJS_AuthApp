import { AuthUserModel } from '../users.type';

export const AuthUserReaderPort = Symbol('AuthUserReaderPort');
export interface IAuthUserReaderPort {
  getUserByEmail(email: string): Promise<AuthUserModel | null>;
  getUserById(id: number): Promise<AuthUserModel | null>;
}
