import { UserAggregate } from '../domain/user.aggregate';
import { IUser } from '../domain/user.interface';

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
  abstract findAll(): Promise<UserAggregate[]>;
  abstract delete(id: string): Promise<UserAggregate>;
}
