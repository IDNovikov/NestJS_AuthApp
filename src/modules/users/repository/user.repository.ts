import { UserAggregate } from '../domain/user.aggregate';
import { IUser } from '../domain/user.interface';

export abstract class UserRepository {
  abstract save(user: IUser): Promise<UserAggregate>;
  abstract findOne(id: string): Promise<UserAggregate>;
  abstract findAll(): Promise<UserAggregate[]>;
  abstract delete(id: string): Promise<UserAggregate>;
}
