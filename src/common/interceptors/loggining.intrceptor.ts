import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import pino from 'pino';
import { Observable, tap } from 'rxjs';

const logger = pino({ level: 'info' });

@Injectable()
export class LoggingInterceptors implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const now = Date.now();
    const handler = `${context.getClass().name}.${context.getHandler().name}`;
    logger.info({ handler }, 'Request start');

    return next
      .handle()
      .pipe(
        tap(() =>
          logger.info({ handler, ms: Date.now() - now }, 'Request end'),
        ),
      );
  }
}
