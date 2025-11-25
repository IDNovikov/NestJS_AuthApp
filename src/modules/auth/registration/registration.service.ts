import { get6NumberCode } from '@/modules/auth/shared/utils/getRandomCodes.util';
import { RedisService } from '@/modules/core/redis/redis.service';
import { MailService } from '@/modules/core/mail/mail.service';
import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { checkPassword } from '../shared/utils/checkPassword.util';
import {
  AuthUserReaderPort,
  IAuthUserReaderPort,
} from '@/modules/core/adapters/users/readers/authUser-reader.port';
import {
  AuthUserWriterPort,
  IAuthUserWriterPort,
} from '@/modules/core/adapters/users/writer/authUser-writer.port';
import { AuthUserModel } from '@/modules/core/adapters/users/users.type';
import { HashService } from '../hash.service';

@Injectable()
export class RegistrationService {
  constructor(
    @Inject(AuthUserReaderPort)
    private userReader: IAuthUserReaderPort,
    @Inject(AuthUserWriterPort)
    private userWriter: IAuthUserWriterPort,
    private mail: MailService,
    private redis: RedisService,
    private hash: HashService,
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
  ): Promise<AuthUserModel> {
    const { isVaild, message } = checkPassword(password);
    if (!isVaild || message) throw new ConflictException(message);

    const hashed = await this.hash.hash(password);

    const user = await this.userWriter.createUser({
      email,
      password: hashed,
      userName,
    });
    if (!user) throw new ForbiddenException('User not created');
    return user;
  }

  async verifyEmail(id: number, email: string, code: string) {
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
    return this.userWriter.updateUser(id, { isEmailVerified: true });
  }

  async checkIsUserVerified(email: string) {
    const user = await this.userReader.getUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    if (user?.isEmailVerified) {
      throw new ForbiddenException('Email is already verifiyed');
    }

    return user;
  }
}
