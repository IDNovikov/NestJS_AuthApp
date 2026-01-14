import { Type } from '@nestjs/common';
import { IQueryHandler } from '@nestjs/cqrs';
import { GetUserQueryHandler } from './get-user/get-user.query-handler';

export const USER_QUERY_HANDLERS: Type<IQueryHandler>[] = [GetUserQueryHandler];
