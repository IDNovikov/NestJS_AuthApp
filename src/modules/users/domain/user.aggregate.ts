import { IUser, UserRoles, UserStatus } from './user.interface';
import { UserServices } from './services';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  validateSync,
} from 'class-validator';
import { Exclude } from 'class-transformer';
import { DomainError } from '@/common/errors/domain.error';

export class UserAggregate extends UserServices implements IUser {
  @IsUUID()
  id = crypto.randomUUID();
  @IsString()
  userName: string;
  @IsString()
  email: string;

  @IsBoolean()
  isEmailVerified: boolean = false;

  @IsString()
  @IsOptional()
  telegramId: string | null = null;

  @IsEnum(UserRoles)
  role: UserRoles = UserRoles.ADMIN;

  @IsEnum(UserStatus)
  status: UserStatus = UserStatus.ACTIVE;

  @IsString()
  @Exclude()
  password: string;

  @IsString()
  @IsOptional()
  userImage: string | null;
  @IsString()
  createdAt = new Date().toISOString();
  @IsString()
  updatedAt = new Date().toISOString();

  private constructor() {
    super();
  }

  static create(user: Partial<IUser>) {
    const _user = new UserAggregate();
    Object.assign(_user, user);
    _user.updatedAt = user?.id ? new Date().toISOString() : _user.updatedAt;
    const errors = validateSync(_user, { whitelist: true });
    if (!!errors.length) throw new DomainError(errors, 'User not valid');
    return _user;
  }
}
