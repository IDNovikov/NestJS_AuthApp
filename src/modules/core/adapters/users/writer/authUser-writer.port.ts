import { AuthUserModel, CreateUser, UpdateUser } from '../users.type';

export const AuthUserWriterPort = Symbol('AuthUserWriterPort');
export interface IAuthUserWriterPort {
  createUser(dto: CreateUser): Promise<AuthUserModel | null>;
  updateUser(id: number, dto: UpdateUser): Promise<AuthUserModel | null>;
}
