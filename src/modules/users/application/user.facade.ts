import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';

@Injectable()
export class UserFacade {
  constructor(
    private readonly CommandBus: CommandBus,
    private readonly QueryBus: QueryBus,
    private readonly EventBus: EventBus,
  ) {}

  commands = {};
  queries = {};
  events = {};
}
