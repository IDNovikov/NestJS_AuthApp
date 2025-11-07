import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class CookieInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const res: Response = context.switchToHttp().getResponse();
    const req: Request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap((data) => {
        if (!data) return;
        if (data.clear_refresh_cookie) {
          res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
          });
          delete data.clear_refresh_cookie;
          return;
        }

        if (data?.refresh_token) {
          res.cookie('refresh_token', data.refresh_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
          });
          delete data.refresh_token;
        }
      }),
    );
  }
}
