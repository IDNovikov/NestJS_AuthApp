import { applyDecorators } from '@nestjs/common';

export function UseSwagger(...decorators: MethodDecorator[]) {
  return applyDecorators(...decorators);
}
