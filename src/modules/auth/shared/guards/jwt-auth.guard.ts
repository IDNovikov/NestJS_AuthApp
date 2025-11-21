import { RedisService } from '@/modules/core/redis/redis.service';
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private redis: RedisService) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const can = await super.canActivate(context);
    if (!can) return false;

    const request = context.switchToHttp().getRequest();
    const jti = request.user.jti;

    const isBlocked = await this.redis.get(`blacklist:${jti}`);
    if (isBlocked) {
      throw new ForbiddenException('Token has been revoked');
    }
    return true;
  }
}
