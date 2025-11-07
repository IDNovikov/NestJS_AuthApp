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

type JWTpayload = {
  userId: number;
  email: string;
  role: 'ADMIN' | 'USER';
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private cfg: ConfigService,
    private hash: HashService,
    private user: UsersService,
    private mail: MailService,
  ) {}

  private async updateRefreshToken(userId: number, refreshToken: string) {
    const hashed = await this.hash.hash(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashed },
    });
  }

  private async generateTokens({
    userId,
    email,
    role,
  }: JWTpayload): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { sub: userId, email, role };
    console.log(payload);
    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.cfg.get('JWT_SECRET'),
        expiresIn: this.cfg.get('JWT_EXPIRES'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.cfg.get('JWT_REFRESH_SECRET'),
        expiresIn: this.cfg.get('JWT_REFRESH_EXPIRES'),
      }),
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

  async login({ userId, email, role }: JWTpayload) {
    const tokens = await this.generateTokens({ userId, email, role });
    await this.updateRefreshToken(userId, tokens.refresh_token);
    return tokens;
  }

  async refreshTokens(refreshToken: string) {
    const { sub, email } = await this.jwt.verify(refreshToken, {
      secret: this.cfg.get('JWT_REFRESH_SECRET'),
    });

    const user = await this.user.getUserById(sub);

    if (!user.refreshToken) throw new ForbiddenException('Mismatch token');
    const match = await this.hash.compare(refreshToken, user.refreshToken);

    if (!match) throw new ForbiddenException('Invalid refresh token');

    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const hashedRefreshToken = await this.hash.hash(tokens.refresh_token);
    await this.user.updateUser(user.id, { refreshToken: hashedRefreshToken });
    return tokens;
  }
  async logout(userId: number) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
  async registrate(userName: string, email: string, password: string) {
    const { isVaild, message } = checkPassword(password);
    if (!isVaild || message) {
      throw new ConflictException(message);
    }
    const code = get6NumberCode();
    const date = new Date(Date.now() + 10 * 60 * 1000);
    const user = await this.user.createUser(
      { email, password, userName },
      code,
      date,
    );
    console.log(user);
    await this.mail.sendVerificationMail(email, code);
    return {
      id: user.id,
      expiresTime: date,
      message: 'User created. Check your email for verification code.',
    };
  }

  async verifyEmail(id: number, code: string) {
    const user = await this.user.getUserById(id);
    const now = new Date();
    if (!user.emailVerifyCode) {
      throw new ForbiddenException('Verification code is missing');
    }

    if (!user.emailVerifyExpired) {
      throw new ForbiddenException('Verification expiry is missing');
    }
    if (user.emailVerifyCode !== code) {
      throw new ForbiddenException('Invalid verification code');
    }

    if (user.emailVerifyExpired <= now) {
      throw new ForbiddenException('Verification code has expired');
    }

    await this.user.updateUser(id, {
      isEmailVerified: true,
      emailVerifyCode: null,
      emailVerifyExpired: null,
    });

    const tokens = await this.login({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    return { userId: user.id, email: user.email, role: user.role, tokens };
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
      refreshToken: null,
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
      refreshToken: null,
    });
  }
}
