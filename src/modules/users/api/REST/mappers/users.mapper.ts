import { User } from '@prisma/client';
import { omit } from '../../../utils/omit';

export class UserMapper {
  static safeUser(user: User) {
    return omit(
      user,
      'password',
      'email',
      'isEmailVerified',
      'telegramId',
      'role',
      'status',
    );
  }

  static privateUser(user: User) {
    return omit(user, 'password');
  }

  static authUser(user: User) {
    return omit(user, 'userImage');
  }
  static publicProfile(user: User) {
    return omit(user, 'password', 'email', 'telegramId');
  }
}
