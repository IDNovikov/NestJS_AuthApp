import { Injectable } from '@nestjs/common';
import { UserReaderPort } from '../types/user-reader.port';
import { UsersService } from '../users.service';
import { SafeUser } from '../types/user.types';

@Injectable()
export class UserReaderLocal implements UserReaderPort {
  constructor(private readonly userService: UsersService) {}

  async findByEmail(email: string): Promise<SafeUser | null> {
    return this.userService.getUserByEmail(email);
  }
  async findById(id: number): Promise<SafeUser | null> {
    return this.userService.getUserById(id);
  }
}
