import { RedisService } from '@/modules/core/redis/redis.service';
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private redis: RedisService) {
    super();
  }
getRequest(context: ExecutionContext) {
  if(context.getType<'graphql'>()==='graphql'){
    const gqlCtx = GqlExecutionContext.create(context)
    return gqlCtx.getContext().req
  }
  return context.switchToHttp().getRequest();
}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const can = await super.canActivate(context);
    if (!can) return false;

    const request = this.getRequest(context)
    const jti = request?.user?.jti;

    if(!jti) throw new ForbiddenException('No provided token')

    const isBlocked = await this.redis.get(`blacklist:${jti}`);
    if (isBlocked) {
      throw new ForbiddenException('Token has been revoked');
    }
    return true;
  }
}
