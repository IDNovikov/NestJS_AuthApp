import { Type } from '@nestjs/common';
import { IEventHandler, IQueryHandler } from '@nestjs/cqrs';

export const USER_QUERY_HANDLERS: Type<IQueryHandler>[] = [];
