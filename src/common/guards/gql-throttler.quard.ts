import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  protected getRequestResponse(context: ExecutionContext) {
    const type = context.getType<string>();

    if (type === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context).getContext<any>();

      const req = gqlCtx.req;

      const res = {
        header: () => {},
        setHeader: () => {},
        getHeader: () => {},
      };

      return { req, res };
    }

    return super.getRequestResponse(context);
  }
}
