import { UserAggregate } from '../domain/user.aggregate';
import { IUser } from '../domain/user.interface';
import { UserQueryDto } from '../dto/user-query.dto';

export abstract class UserRepository {
  abstract create(user: IUser): Promise<UserAggregate>;
  гументах;
  //Что принимаем в аргументах?
  abstract update(user: IUser): Promise<UserAggregate>;
  abstract findOneById(id: string): Promise<UserAggregate>;
  abstract findFirstByEmailOrName(
    userName: string,
    email: string,
  ): Promise<UserAggregate>;
  abstract findAll(
    dto: UserQueryDto,
  ): Promise<[UserAggregate[], total: number]>;
  abstract delete(id: string): Promise<UserAggregate>;
}
