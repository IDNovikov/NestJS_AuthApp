import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HashService } from './hash.service';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';

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

    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.cfg.get('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: this.cfg.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);
    return { access_token, refresh_token };
  }

  async validateUser(email: string, password: string) {
    const user = await this.user.getUserByEmail(email);
    if (!user || !user.email || !user.password)
      throw new UnauthorizedException('Invalid email');
    const valid = await this.hash.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid email');

    return { id, email, userName };
  }

  async login({ userId, email, role }: JWTpayload) {
    const tokens = await this.generateTokens({ userId, email, role });
    await this.updateRefreshToken(userId, tokens.refresh_token);
    return tokens;
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.user.getUserById(userId);
    if (!user || !user.refreshToken || !user.id || !user.email)
      throw new ForbiddenException('Access Denied');
    const match = await this.hash.compare(refreshToken, user.refreshToken);
    if (!match) throw new ForbiddenException('Invalid refresh token');

    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    return tokens;
  }
  async logout(userId: number) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
}
