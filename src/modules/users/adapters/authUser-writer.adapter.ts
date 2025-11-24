import { Injectable } from '@nestjs/common';
import { UsersService } from '../users.service';
import { UserMapper } from '../mappers/users.mapper';
import { AuthUserModel } from '../../core/adapters/users/users.type';
import { IAuthUserWriterPort } from '../../core/adapters/users/writer/authUser-writer.port';
import { IUpdateUserDto } from '../dto/update-user.dto';
import { ICreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class AuthUserWriterLocal implements IAuthUserWriterPort {
  constructor(private readonly userService: UsersService) {}

  async createUser(dto: ICreateUserDto): Promise<AuthUserModel | null> {
    const user = await this.userService.createUser(dto);
    return UserMapper.authUser(user);
  }

  async updateUser(
    id: number,
    dto: IUpdateUserDto,
  ): Promise<AuthUserModel | null> {
    const user = await this.userService.updateUser({ id }, dto);
    return UserMapper.authUser(user);
  }
}
