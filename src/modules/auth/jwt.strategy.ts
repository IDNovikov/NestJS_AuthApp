import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../core/redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    cfg: ConfigService,
    private redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: cfg.get('JWT_SECRET') as string,
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
    role: 'ADMIN' | 'USER';
    jti: string;
  }) {
    console.log(payload);
    // const blockedToken = await this.redis.get(`blacklist${payload.jti}`);
    // if (blockedToken) {
    //   throw new ForbiddenException('User is blocked');
    // }
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
    };
  }
}
