import { Injectable } from '@nestjs/common';
import { authUserReaderLocal } from '../types/user-reader.port';
import { UsersService } from '../users.service';

@Injectable()
export class authUserReaderLocal implements authUserReaderLocal {
  constructor(private readonly usersService: UsersService) {}

  async getUserByEmail(email: string): Promise<SafeUser | null> {
    return this.usersService.getUserByEmail(email);
  }
  async getUserById(id: number): Promise<SafeUser | null> {
    return this.usersService.getUserById(id);
  }
}
