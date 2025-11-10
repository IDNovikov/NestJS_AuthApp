import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AccessToken = createParamDecorator((_, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().headers.authorization;
});
