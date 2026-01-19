import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { UserFacade } from '../application/user.facade';

export const userFacadeFactory = (
  commandBus: CommandBus,
  queryBus: QueryBus,
  eventBus: EventBus,
) => new UserFacade(commandBus, queryBus, eventBus);
