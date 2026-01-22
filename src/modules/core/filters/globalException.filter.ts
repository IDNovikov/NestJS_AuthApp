import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter<T> implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  catch(exception: T, host: ArgumentsHost) {
    if (host.getType() !== 'http') {
      throw exception;
    }
    this.logger.error(exception);

    const context = host.switchToHttp();

    const res = context.getResponse<Response>();
    const req = context.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    res.status(status).json(this._response(status, req, exception));
  }

  private _response(status: number, req: Request, exception: any) {
    return {
      statusCode: status,
      timeStamp: new Date().toISOString(),
      path: req?.method,
      params: req?.params,
      query: req?.query,
      exception: {
        name: exception['name'],
        message: exception['message'],
      },
    };
  }
}
