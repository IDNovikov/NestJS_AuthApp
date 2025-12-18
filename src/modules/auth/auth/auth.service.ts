import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HashService } from '../hash.service';
import { RedisService } from '@/modules/core/redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ISessionData } from '@/modules/auth/shared/decorators/sessionData.decorator';
import {
  IAccessPayload,
  IRefreshPayload,
  UnionJWTpayload,
  RedisRefreshValue,
} from '@/modules/auth/shared/types/auth.types';

import { redisRefreshString } from '@/modules/auth/shared/utils/redisRefreshString.utol';
import {
  AuthUserReaderPort,
  IAuthUserReaderPort,
} from '@/modules/core/adapters/users/readers/authUser-reader.port';
import { parseTTL } from '../shared/utils/parseTTL';

@Injectable()
export class AuthService {
  private _access_token_secret;
  private _access_token_expires;
  private _refresh_token_secret;
  private _refresh_token_expires;

  constructor(
    @Inject(AuthUserReaderPort)
    private readonly user: IAuthUserReaderPort,
    private hash: HashService,
    private redis: RedisService,
    private jwt: JwtService,
    private cfg: ConfigService,
  ) {
    this._access_token_secret = this.cfg.get('JWT_SECRET');
    this._access_token_expires = this.cfg.get('JWT_EXPIRES');
    this._refresh_token_secret = this.cfg.get('JWT_REFRESH_SECRET');
    this._refresh_token_expires = this.cfg.get('JWT_REFRESH_EXPIRES');
  }

  async generateAndUpdateTokens(
    { sub, email, role }: UnionJWTpayload,
    sessionData: ISessionData,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const deviceId = randomUUID();
    const jti = randomUUID();

    const accessPayload: IAccessPayload = {
      sub,
      email,
      role,
      jti,
    };

    const refreshPayload: IRefreshPayload = {
      sub,
      email,
      role,
      deviceId,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(accessPayload, {
        secret: this._access_token_secret,
        expiresIn: this._access_token_expires,
      }),
      this.jwt.signAsync(refreshPayload, {
        secret: this._refresh_token_secret,
        expiresIn: this._refresh_token_expires,
      }),
    ]);

    const hashed = await this.hash.hash(refresh_token);

    const payload: RedisRefreshValue = {
      hash: hashed,
      jti: jti,
      sessionData: sessionData,
      createdAt: Date.now(),
    };
    await this.redis.set(
      redisRefreshString(sub, deviceId),
      payload,
      parseTTL(this._refresh_token_expires),
    );

    return { access_token, refresh_token };
  }

  async validateUser(
    email: string,
    password: string,
    token: string | undefined | null,
  ): Promise<UnionJWTpayload> {
    if (token) throw new ForbiddenException('Delete cookies or refresh tokens');

    const user = await this.user.getUserByEmail(email);
    if (!user || !user.email || !user.password || user.status !== 'ACTIVE')
      throw new UnauthorizedException('Invalid email');
    const valid = await this.hash.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Wrong password');
    return { sub: user.id, email: user.email, role: user.role };
  }

  async checkRefreshToken(
    refreshToken: string,
  ): Promise<IRefreshPayload & { jti: string }> {
    const { sub, email, role, deviceId } = await this.jwt.verify(refreshToken, {
      secret: this._refresh_token_secret,
    });
    const data = await this.redis.get<RedisRefreshValue>(
      redisRefreshString(sub, deviceId),
    );
    if (!data?.hash) throw new ForbiddenException('Mismatch token');
    const match = await this.hash.compare(refreshToken, data?.hash);
    if (!match) throw new ForbiddenException('Invalid refresh token');
    return { sub, email, role, deviceId, jti: data.jti };
  }
}
