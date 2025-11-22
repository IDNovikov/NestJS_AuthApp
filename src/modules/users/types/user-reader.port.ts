import { User } from '@prisma/client';
import { SafeUser } from './user.types';

export interface PublicUserReaderPort {
  getUserByEmail(email: string): Promise<SafeUser | null>;
  getUserById(id: number): Promise<SafeUser | null>;
}

export interface AuthUserReaderPort {
  getUserByEmailWithPassword(email: string): Promise<User | null>;
  getUserByIdWithPassword(id: number): Promise<User | null>;
}
