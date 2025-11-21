import { ISessionData } from '@/modules/auth/shared/decorators/sessionData.decorator';
import { get6NumberCode } from '@/modules/auth/shared/utils/getRandomCodes.util';
import { RedisService } from '@/modules/core/redis/redis.service';
import { MailService } from '@/modules/mail/mail.service';
import { SafeUser } from '@/modules/users/types/user.types';
import { UsersService } from '@/modules/users/users.service';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { checkPassword } from '../shared/utils/checkPassword.util';

@Injectable()
export class RegistrationService {
  constructor(
    private mail: MailService,
    private user: UsersService,
    private redis: RedisService,
  ) {}

  async sendEmailCode(
    email: string,
  ): Promise<{ code: string; codeExpired: Date }> {
    const code = get6NumberCode();
    const codeExpired = new Date(Date.now() + 10 * 60 * 1000);

    await this.mail.sendVerificationMail(email, code);

    await this.redis.set(email, { code, codeExpired }, 1800);
    return { code, codeExpired };
  }

  async registrate(
    userName: string,
    email: string,
    password: string,
  ): Promise<User> {
    const { isVaild, message } = checkPassword(password);
    if (!isVaild || message) throw new ConflictException(message);
    const user = await this.user.createUser({ email, password, userName });
    return user;
  }

  async verifyEmail(
    id: number,
    email: string,
    code: string,
  ): Promise<SafeUser> {
    const validData = await this.redis.get<{
      code: string;
      codeExpired: Date;
    }>(email);

    if (!validData?.code) {
      throw new ForbiddenException('Verification code is missing');
    }

    if (!validData?.codeExpired || validData.code !== code) {
      throw new ForbiddenException('Verification code is not actual');
    }
    if (validData.codeExpired <= new Date()) {
      throw new ForbiddenException('Verification code has expired');
    }
    await this.redis.del(email);
    return this.user.updateUser({ id }, { isEmailVerified: true });
  }

  async checkIsUserVerified(email: string): Promise<SafeUser> {
    const user = await this.user.getUserByEmail(email);

    if (user.isEmailVerified) {
      throw new ForbiddenException('Email is already verifiyed');
    }

    return user;
  }
}
