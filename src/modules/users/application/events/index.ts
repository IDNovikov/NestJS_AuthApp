import { Type } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';

export const USER_EVENT_HANDLERS: Type<IEventHandler>[] = [];
