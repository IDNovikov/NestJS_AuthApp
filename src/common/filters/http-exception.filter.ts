import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalHttpExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const res = context.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const message = exception?.message ?? 'Internal error';
    res.status(status).json({ statusCode: status, message });
  }
}
