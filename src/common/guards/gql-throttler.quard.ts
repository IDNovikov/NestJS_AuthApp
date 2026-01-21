import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  protected getRequestResponse(context: ExecutionContext) {
    if (context.getType() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context).getContext<{
        req: any;
        res: any;
      }>();
    }
  }
}
