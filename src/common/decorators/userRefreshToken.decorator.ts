import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const User = createParamDecorator((_, ctx: ExecutionContext) => {
  if(ctx.getType<'graphql'>()==='graphql'){
    const gqlCtx = GqlExecutionContext.create(ctx)
    return gqlCtx.getContext().req.user
  }
  
  
  
  return ctx.switchToHttp().getRequest().user;
});
