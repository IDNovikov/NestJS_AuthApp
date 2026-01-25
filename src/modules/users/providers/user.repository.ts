import { UserAggregate } from '../domain/user.aggregate';
import { IUser } from '../domain/user.interface';
import { GetUsersDTO } from './dto/get-users.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

export abstract class UserRepository {
  abstract create(user: IUser): Promise<UserAggregate>;

  abstract update(
    identifier: { id: number } | { email: string },
    dto: UpdateUserDTO,
  ): Promise<UserAggregate>;

  abstract findUser(
    {id, email, userName}:{id?:number, email?:string, userName?:string},
  ): Promise<UserAggregate|null>;

  abstract findAll(
    dto: GetUsersDTO,
  ): Promise<{ data: UserAggregate[]; total: number }>;

  abstract delete(id: number): Promise<UserAggregate>;

  abstract deleteUnverifiedUsers(): Promise<number>;
}
