import { IUser } from '@/modules/users/domain/user.interface';

export type CreateUserDTO = Pick<IUser, 'email' | 'password' | 'userName'>;
