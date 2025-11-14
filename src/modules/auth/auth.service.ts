import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
import { ISessionData } from '@/common/decorators/sessionData.decorator';

type JWTpayload = {
  userId: number;
  email: string;
  role: 'ADMIN' | 'USER';
};

interface refreshTokenData {
  hash: string;
  jti: string;
  sessionData: ISessionData;
  createdAt: string;
}

function redisRefreshString(id: number, deviceId: string) {
  return `refreshToken:${id}:${deviceId}`;
}

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

  private async updateRefreshToken(
    userId: number,
    deviceId: string,
    jti: string,
    refreshToken: string,
    sessionData: ISessionData,
  ) {
    ///////ТУТ КАКАЯ-ТО ПОЛНАЯ ЖОПА С ДАТАМИ И ВРЕМЕНЕМ

    const hashed = await this.hash.hash(refreshToken);

    await this.redis.set(
      redisRefreshString(userId, deviceId),
      {
        hash: hashed,
        jti: jti,
        sessionData: sessionData,
        createdAt: new Date(),
      },
      2592000,
    );
  }

  private async generateTokens({ userId, email, role }: JWTpayload): Promise<{
    access_token: string;
    refresh_token: string;
    deviceId: string;
    jti: string;
  }> {
    const deviceId = randomUUID();
    const jti = randomUUID();

    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(
        { sub: userId, email, role, jti },
        {
          secret: this.cfg.get('JWT_SECRET'),
          expiresIn: this.cfg.get('JWT_EXPIRES'),
        },
      ),
      this.jwt.signAsync(
        { sub: userId, email, role, deviceId },
        {
          secret: this.cfg.get('JWT_REFRESH_SECRET'),
          expiresIn: this.cfg.get('JWT_REFRESH_EXPIRES'),
        },
      ),
    ]);

    return { access_token, refresh_token, deviceId, jti };
  }

  //FACADE
  async validateUser(
    email: string,
    password: string,
    token: string | undefined | null,
    sessionData: ISessionData,
  ) {
    if (token) {
      throw new ForbiddenException('Delete cookies or refresh tokens');
    }
    const user = await this.user.getUserByEmail(email, true);
    if (!user || !user.email || !user.password || user.status !== 'ACTIVE')
      throw new UnauthorizedException('Invalid email');
    const valid = await this.hash.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Wrong password');

    const { refresh_token, access_token } = await this.login(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      sessionData,
    );

    return {
      message: 'Login successful',
      user: { id: user.id, email: user.email, role: user.role },
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }

  async registrate(userName: string, email: string, password: string) {
    const { isVaild, message } = checkPassword(password);
    if (!isVaild || message) {
      throw new ConflictException(message);
    }
    const code = get6NumberCode();
    const codeExpired = new Date(Date.now() + 10 * 60 * 1000);

    const user = await this.user.createUser({ email, password, userName });

    await this.redis.set(email, { id: user.id, code, codeExpired }, 1800);

    await this.mail.sendVerificationMail(email, code);

    return {
      email: user.email,
      expiresTime: codeExpired,
      message: 'User created. Check your email for verification code.',
    };
  }
  //FACADE
  async verifyEmail(email: string, code: string, sessionData: ISessionData) {
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
    const tokens = await this.login(
      {
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      sessionData,
    );
    return {
      user: {
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
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

    await this.redis.set(email, { id: user.id, code, codeExpired }, 1800);

    await this.mail.sendVerificationMail(email, code);

    return {
      email: user.email,
      expiresTime: codeExpired,
      message: 'Check your email for verification code.',
    };
  }

  //FACADE
  async login({ userId, email, role }: JWTpayload, sessionData: ISessionData) {
    const { access_token, refresh_token, deviceId, jti } =
      await this.generateTokens({
        userId,
        email,
        role,
      });
    console.log(
      'LOGIN GENERATED TOKENS:',

      deviceId,
    );

    await this.updateRefreshToken(
      userId,
      deviceId,
      jti,
      refresh_token,
      sessionData,
    );
    return { access_token, refresh_token };
  }

  //FACADE
  async refreshTokens(refreshToken: string, sessionData: ISessionData) {
    const { sub, email, role, deviceId } = await this.jwt.verify(refreshToken, {
      secret: this.cfg.get('JWT_REFRESH_SECRET'),
    });
    const data = await this.redis.get<refreshTokenData>(
      redisRefreshString(sub, deviceId),
    );

    if (!data?.hash) throw new ForbiddenException('Mismatch token');

    const match = await this.hash.compare(refreshToken, data?.hash);

    if (!match) throw new ForbiddenException('Invalid refresh token');

    await this.redis.del(redisRefreshString(sub, deviceId));

    const tokens = await this.generateTokens({
      userId: sub,
      email: email,
      role: role,
    });
    await this.updateRefreshToken(
      sub,
      tokens.deviceId,
      tokens.jti,
      tokens.refresh_token,
      sessionData,
    );

    return {
      message: 'Tokens refreshed',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
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
    await this.user.updateUser(id, {
      password: hashedPassword,
    });
    return { message: 'Password changed succsessed' };
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
    await this.user.updateUser(user.id, {
      password: hashedPassword,
    });

    return { message: 'Password successfully changed. Check your email' };
  }

  async getUserSessions(
    id: number,
  ): Promise<{ deviceId: string | null; session: ISessionData | null }[]> {
    const data = await this.redis.getMany<refreshTokenData>(`refreshToken`);
    const sessions = data.map((el) => {
      let data: { deviceId: string | null; session: ISessionData | null } = {
        deviceId: null,
        session: null,
      };
      if (el.key) {
        data.deviceId = el.key.split(':')[2];
      }
      if (el.value?.sessionData) {
        data.session = el.value?.sessionData;
      }

      return data;
    });
    return sessions;
  }

  async getAllSessionsByAdmin(): Promise<
    { key: string | null; session: ISessionData | null }[]
  > {
    const data = await this.redis.getMany<refreshTokenData>(`refreshToken`);
    const sessions = data.map((el) => {
      let data: { key: string | null; session: ISessionData | null } = {
        key: null,
        session: null,
      };
      if (el.value?.sessionData) {
        data.session = el.value?.sessionData;
      }
      if (el.key) {
        data.key = el.key;
      }
      return data;
    });
    return sessions;
  }

  //logout
  async logout(userId: number, token: string, jti: string) {
    const { deviceId } = await this.jwt.verify(token, {
      secret: this.cfg.get('JWT_REFRESH_SECRET'),
    });
    await this.redis.set(`blacklist:${jti}`, 1, 100500);

    await this.redis.del(`refreshToken:${userId}:${deviceId}`);
    return { clear_refresh_cookie: true, message: 'User logged out' };
  }

  async logoutUserSessionsByAdmin(id: number) {
    const data = await this.redis.getMany<refreshTokenData>(
      `refreshToken:${id}`,
    );

    data.forEach(async (value) => {
      await this.redis.set(`blacklist:${value.value?.jti}`, 1, 100500);
    });

    await this.redis.delMany(`refreshToken:${id}`);
    return { message: 'All users sessions canceled' };
  }

  async logoutAllSessionsByAdmin() {
    const data = await this.redis.getMany<refreshTokenData>(`refreshToken`);

    data.forEach(async (value) => {
      await this.redis.set(`blacklist:${value.value?.jti}`, 1, 100500);
    });

    await this.redis.delMany(`refreshToken`);
    return { message: 'All sessions canceled' };
  }

  async logoutSession(id: number, deviceId: string) {
    const sessionKey = redisRefreshString(id, deviceId);
    const session = await this.redis.get<refreshTokenData>(sessionKey);
    if (!session) {
      return { message: `Session ${deviceId} is not exist` };
    }
    await this.redis.set(`blacklist:${session.jti}`, 1, 100500);

    await this.redis.del(sessionKey);

    return { message: `Session ${deviceId} successful deleted` };
  }
}
