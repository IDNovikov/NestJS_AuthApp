import { Injectable } from '@nestjs/common';
import { IUserReaderPort } from '../../core/adapters/users/readers/user-reader.port';
import { UsersService } from '../users.service';
import { UserMapper } from '../api/REST/mappers/users.mapper';

@Injectable()
export class UserReaderLocal implements IUserReaderPort {
  constructor(private readonly userService: UsersService) {}

  async getUserByEmail(email: string) {
    const user = await this.userService.getUser({ email });
    return UserMapper.privateUser(user);
  }
  async getUserById(id: number) {
    const user = await this.userService.getUser({ id });
    return UserMapper.privateUser(user);
  }
}
