import { IUser } from './user.interface';
import { UserServices } from './services';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';
import { Exclude } from 'class-transformer';
import { DomainError } from '@/common/errors/domain.error';
import { $Enums } from '@prisma/client';

export class UserAggregate extends UserServices implements IUser {
  @IsOptional()
  @IsNumber()
  id;
  @IsString()
  userName: string;
  @IsString()
  email: string;

  @IsBoolean()
  isEmailVerified: boolean = false;

  @IsString()
  @IsOptional()
  telegramId: string | null = null;

  @IsEnum($Enums.userRoles)
  role: $Enums.userRoles = $Enums.userRoles.USER;

  @IsEnum($Enums.userStatus)
  status: $Enums.userStatus = $Enums.userStatus.ACTIVE;

  @IsString()
  @Exclude()
  password: string;

  @IsString()
  @IsOptional()
  userImage: string | null;
  @IsDate()
  createdAt = new Date();
  //.toISOString();
  @IsDate()
  updatedAt = new Date();
  //.toISOString();

  private constructor() {
    super();
  }

  static create(user: Partial<IUser>) {
    const _user = new UserAggregate();
    Object.assign(_user, user);
    _user.updatedAt = user?.id
      ? new Date()
      : //.toISOString()
        _user.updatedAt;
    const errors = validateSync(_user, { whitelist: true });
    if (!!errors.length) throw new DomainError(errors, 'User not valid');
    return _user;
  }
}
