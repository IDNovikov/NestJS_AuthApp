import { getRandomPass } from '@/modules/auth/shared/utils/getRandomCodes.util';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HashService } from '../hash.service';
import { checkPassword } from '../shared/utils/checkPassword.util';
import { RedisService } from '@/modules/core/redis/redis.service';
import {
  getCooldownByLevel,
  timeHumanize,
} from '../shared/utils/passCooldown.util';
import {
  AuthUserReaderPort,
  IAuthUserReaderPort,
} from '@/modules/core/adapters/users/readers/authUser-reader.port';
import {
  AuthUserWriterPort,
  IAuthUserWriterPort,
} from '@/modules/core/adapters/users/writer/authUser-writer.port';

@Injectable()
export class PasswordService {
  constructor(
    @Inject(AuthUserReaderPort)
    private userReader: IAuthUserReaderPort,
    @Inject(AuthUserWriterPort)
    private userWriter: IAuthUserWriterPort,
    private hash: HashService,

    private redis: RedisService,
  ) {}

  async getUserByEmail(email: string) {
    const user = await this.userReader.getUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserPassword(userId: number, password: string): Promise<void> {
    const { isVaild, message } = checkPassword(password);

    if (!isVaild) {
      throw new ConflictException(message);
    }
    const hashedPassword = await this.hash.hash(password);

    await this.userWriter.updateUser(userId, {
      password: hashedPassword,
    });
  }

  async checkPasswords(
    id: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (oldPassword === newPassword)
      throw new BadRequestException('Passwords must differ');

    const user = await this.userReader.getUserById(id);
    if (!user) throw new NotFoundException('User not found');
    if (!user.password) {
      throw new BadRequestException('User has no password');
    }

    const isCorrectPass = await this.hash.compare(oldPassword, user.password);
    if (!isCorrectPass) {
      throw new UnauthorizedException('Wrong old password');
    }
  }

  generateNewPassword(): string {
    let tempPass = getRandomPass(10);

    const { isVaild } = checkPassword(tempPass);
    if (!isVaild) {
      tempPass = getRandomPass(10);
    }

    return tempPass;
  }

  async isPasswordSend(email: string): Promise<void> {
    const blockKey = `passChanging:${email}:block`;
    const levelKey = `passChanging:${email}:level`;

    type RedisPasswordChangeValue = { changeAt: number; cooldown: number };
    const block = await this.redis.get<RedisPasswordChangeValue>(blockKey);

    const now = Date.now();

    if (block?.cooldown) {
      const deltaTime = now - block?.changeAt;
      const remain = block?.cooldown;

      throw new BadRequestException(
        `Try again after ${timeHumanize(remain - deltaTime)} `,
      );
    }

    const levelStr = await this.redis.get(levelKey);
    const level = levelStr ? Number(levelStr) : 0;

    const cooldown: number = getCooldownByLevel(level);

    const blockPayload: RedisPasswordChangeValue = {
      changeAt: now,
      cooldown,
    };
    await this.redis.set(blockKey, blockPayload, Math.floor(cooldown / 1000));

    await this.redis.set(levelKey, String(level + 1), 30 * 24 * 60 * 60);

    return;
  }
}
