import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserDTO } from './commands/dto/create-user.dto';
import { CreateUserCommand } from './commands/create-user/create-user.command';
import { CreateUserCommandHandler } from './commands/create-user/create-user.command-handler';
import { GetUserQuery } from './queries/get-user/get-user.query';

import { GetUsersQuery } from './queries/get-users/get-users.query';
import { GetUserQueryHandler } from './queries/get-user/get-user.query-handler';
import { GetUsersQueryHandler } from './queries/get-users/get-users.query-handler';
import { UserAggregate } from '../domain/user.aggregate';
import { GetUsersDTO } from '../providers/dto/get-users.dto';

@Injectable()
export class UserFacade {
  constructor(
    private readonly CommandBus: CommandBus,
    private readonly QueryBus: QueryBus,
    private readonly EventBus: EventBus,
  ) {}

  commands = {
    createUser: (user: CreateUserDTO) => this.createUser(user),
  };
  queries = {
    getUser: (id: number) => this.getUser(id),
    getUsers: (dto: GetUsersDTO) => this.getUsers(dto),
  };
  events = {};

  private createUser(user: CreateUserDTO) {
    return this.CommandBus.execute<
      CreateUserCommand,
      CreateUserCommandHandler['execute']
    >(new CreateUserCommand(user));
  }

  //update
  //delete

  private getUser(id: number) {
    return this.QueryBus.execute<GetUserQuery, UserAggregate>(
      new GetUserQuery(id),
    );
  }

  private getUsers(dto: GetUsersDTO) {
    return this.QueryBus.execute<
      GetUsersQuery,
      { data: UserAggregate[]; total: number }
    >(new GetUsersQuery(dto));
  }
}
