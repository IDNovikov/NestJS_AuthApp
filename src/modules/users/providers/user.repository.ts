import { UserAggregate } from '../domain/user.aggregate';
import { IUser } from '../domain/user.interface';
import { IUpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';

export abstract class UserRepository {
  abstract create(user: IUser): Promise<UserAggregate>;

  //Что принимаем в аргументах?
  abstract update(
    identifier: { id: number } | { email: string },
    dto: IUpdateUserDto,
  ): Promise<UserAggregate>;

  abstract findUser(
    identifier: { id: number } | { email: string } | { userName: string },
  ): Promise<UserAggregate>;

  abstract findAll(
    dto: UserQueryDto,
  ): Promise<{ data: UserAggregate[]; total: number }>;

  abstract delete(id: number): Promise<UserAggregate>;

  abstract deleteUnverifiedUsers(): Promise<number>;
}
