import { Injectable } from '@nestjs/common';
import { UsersService } from '../users.service';
import { UserMapper } from '../mappers/users.mapper';
import { IAuthUserReaderPort } from '../../core/adapters/users/readers/authUser-reader.port';
import { AuthUserModel } from '../../core/adapters/users/users.type';

@Injectable()
export class AuthUserReaderLocal implements IAuthUserReaderPort {
  constructor(private readonly userService: UsersService) {}

  async getUserByEmail(email: string): Promise<AuthUserModel> {
    const user = await this.userService.getUser({ email });
    return UserMapper.authUser(user);
  }
  async getUserById(id: number): Promise<AuthUserModel> {
    const user = await this.userService.getUser({ id });
    return UserMapper.authUser(user);
  }
}
