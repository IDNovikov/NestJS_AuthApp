import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HashService } from './hash.service';
import { UsersService } from '../users/users.service';
import { checkPassword } from '@/common/utils/checkPassword.util';
import {
  get6NumberCode,
  getRandomPass,
} from '@/common/utils/getRandomCodes.util';
import { MailService } from '../mail/mail.service';
import { RedisService } from '../core/redis/redis.service';
import { randomUUID } from 'crypto';
import { days } from '@nestjs/throttler';

type JWTpayload = {
  userId: number;
  email: string;
  role: 'ADMIN' | 'USER';
};

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private cfg: ConfigService,
    private hash: HashService,
    private user: UsersService,
    private mail: MailService,
    private redis: RedisService,
  ) {}

  private async updateRefreshToken(userId: number, refreshToken: string) {
    ///////ТУТ КАКАЯ-ТО ПОЛНАЯ ЖОПА С ДАТАМИ И ВРЕМЕНЕМ

    const { sub, email, role, deviceId } = await this.jwt.verify(refreshToken, {
      secret: this.cfg.get('JWT_REFRESH_SECRET'),
    });

    await this.redis.del(`user:${userId}:${deviceId}`);

    const hashed = await this.hash.hash(refreshToken);

    await this.redis.set(`user:${userId}:${deviceId}`, hashed, 2592000);
  }

  private async generateTokens({
    userId,
    email,
    role,
  }: JWTpayload): Promise<{ access_token: string; refresh_token: string }> {
    const deviceId = randomUUID();
    const jti = randomUUID();

    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(
        { sub: userId, email, role, jti: jti },
        {
          secret: this.cfg.get('JWT_SECRET'),
          expiresIn: this.cfg.get('JWT_EXPIRES'),
        },
      ),
      this.jwt.signAsync(
        { sub: userId, email, role, deviceId: deviceId },
        {
          secret: this.cfg.get('JWT_REFRESH_SECRET'),
          expiresIn: this.cfg.get('JWT_REFRESH_EXPIRES'),
        },
      ),
    ]);

    return { access_token, refresh_token };
  }

  async validateUser(email: string, password: string) {
    const user = await this.user.getUserByEmail(email, true);
    if (!user || !user.email || !user.password || user.status !== 'ACTIVE')
      throw new UnauthorizedException('Invalid email');
    const valid = await this.hash.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Wrong password');
    return { id: user.id, email: user.email, role: user.role };
  }

  async registrate(userName: string, email: string, password: string) {
    const { isVaild, message } = checkPassword(password);
    if (!isVaild || message) {
      throw new ConflictException(message);
    }
    const code = get6NumberCode();
    const codeExpired = new Date(Date.now() + 10 * 60 * 1000);

    const user = await this.user.createUser({ email, password, userName });

    console.log(code);

    await this.redis.set(email, { id: user.id, code, codeExpired }, 1800);

    console.log(user);

    await this.mail.sendVerificationMail(email, code);

    return {
      email: user.email,
      expiresTime: codeExpired,
      message: 'User created. Check your email for verification code.',
    };
  }

  async verifyEmail(email: string, code: string) {
    const validData = await this.redis.get<{
      id: number;
      code: string;
      codeExpired: Date;
    }>(email);

    const now = new Date();

    if (!validData?.code || !validData?.id) {
      throw new ForbiddenException('Verification code is missing');
    }

    if (!validData?.codeExpired) {
      throw new ForbiddenException('Verification expiry is missing');
    }
    if (validData.code !== code) {
      throw new ForbiddenException('Invalid verification code');
    }

    if (validData.codeExpired <= now) {
      throw new ForbiddenException('Verification code has expired');
    }

    const updatedUser = await this.user.updateUser(validData.id, {
      isEmailVerified: true,
    });

    await this.redis.del(email);
    const tokens = await this.login({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    });
    return {
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      tokens,
    };
  }

  async getNewVerificationCode(email: string) {
    const validData = await this.redis.get<{
      id: number;
      code: string;
      codeExpired: Date;
    }>(email);

    if (validData) {
      await this.redis.del(email);
    }
    const user = await this.user.getUserByEmail(email);

    if (user.isEmailVerified) {
      throw new ForbiddenException('Email is already verifiyed');
    }
    const code = get6NumberCode();
    const codeExpired = new Date(Date.now() + 10 * 60 * 1000);

    console.log(code);
    await this.redis.set(email, { id: user.id, code, codeExpired }, 1800);

    await this.mail.sendVerificationMail(email, code);

    return {
      email: user.email,
      expiresTime: codeExpired,
      message: 'Check your email for verification code.',
    };
  }
  async login({ userId, email, role }: JWTpayload) {
    const tokens = await this.generateTokens({ userId, email, role });

    await this.updateRefreshToken(userId, tokens.refresh_token);
    return tokens;
  }

  async refreshTokens(refreshToken: string) {
    const { sub, email, role, deviceId } = await this.jwt.verify(refreshToken, {
      secret: this.cfg.get('JWT_REFRESH_SECRET'),
    });
    const token = await this.redis.get(`user:${sub}:${deviceId}`);

    if (!token) throw new ForbiddenException('Mismatch token');

    if (typeof token !== 'string') {
      throw new ForbiddenException('Mismatch token');
    }
    const match = await this.hash.compare(refreshToken, token);

    if (!match) throw new ForbiddenException('Invalid refresh token');

    const tokens = await this.generateTokens({
      userId: sub,
      email: email,
      role: role,
    });

    await this.updateRefreshToken(sub, refreshToken);
    return tokens;
  }

  async logout(userId: number, token: string) {
    const { sub, email, role, deviceId } = await this.jwt.verify(token, {
      secret: this.cfg.get('JWT_REFRESH_SECRET'),
    });

    await this.redis.set(`blacklist${'jti'}`, 'someValue', 100500);
    return await this.redis.del(`user:${userId}:${deviceId}`);
  }

  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const { isVaild, message } = checkPassword(newPassword);
    if (!isVaild) {
      throw new ConflictException(message);
    }
    const user = await this.user.getUserById(id, true);
    if (!user.password) {
      throw new ConflictException('Original password not found');
    }
    const isCorrectPass = await this.hash.compare(oldPassword, user.password);
    if (!isCorrectPass) {
      throw new ConflictException('Wrong old password');
    }
    const hashedPassword = await this.hash.hash(newPassword);
    if (hashedPassword === user.password) {
      throw new ConflictException('Passwords must be diff');
    }
    return await this.user.updateUser(id, {
      password: hashedPassword,
    });
  }

  async getTempPass(email: string) {
    const user = await this.user.getUserByEmail(email);
    let tempPass = getRandomPass(10);
    const { isVaild } = checkPassword(tempPass);
    if (!isVaild) {
      tempPass = getRandomPass(10);
    }
    await this.mail.sendTempPass(email, tempPass);
    const hashedPassword = await this.hash.hash(tempPass);
    return await this.user.updateUser(user.id, {
      password: hashedPassword,
    });
  }

  async logoutSession(deviceId: string, accessToken: string) {}
}
