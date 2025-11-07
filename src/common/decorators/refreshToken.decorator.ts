import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RefreshToken = createParamDecorator((_, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().cookies.refresh_token;
});
