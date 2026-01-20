import { Module, OnModuleInit } from '@nestjs/common';
import { UsersController } from './api/REST/users.controller';
import { UsersService } from './users.service';
import { RedisModule } from '../core/redis/redis.module';
import { PrismaService } from '../core/prisma/prisma.service';
import { UserResolver } from './api/GQL/users.resolver';
import { ScheduleModule } from '@nestjs/schedule';
import { UnVerifiedUsersCleanUpCron } from './providers/cron/unVerifiedUsersCleanUp.job';
import { AuthUserReaderLocal } from './adapters/authUser-reader.adapter';
import { AuthUserWriterLocal } from './adapters/authUser-writer.adapter';
import { CommandBus, CqrsModule, EventBus, QueryBus } from '@nestjs/cqrs';
import { USER_COMMAND_HANDLERS } from './application/commands';
import { USER_QUERY_HANDLERS } from './application/queries';
import { USER_EVENT_HANDLERS } from './application/events';
import { UserFacade } from './application/user.facade';
import { userFacadeFactory } from './providers/user-facade.factory';
import { UserRepository } from './providers/user.repository';
import { UserAdapter } from './providers/user.adapter';

@Module({
  imports: [RedisModule, ScheduleModule.forRoot(), CqrsModule],
  controllers: [UsersController],
  providers: [
    ...USER_COMMAND_HANDLERS,
    ...USER_QUERY_HANDLERS,
    ...USER_EVENT_HANDLERS,
    {
      provide: UserFacade,
      inject: [CommandBus, QueryBus, EventBus],
      useFactory: userFacadeFactory,
    },
    { provide: UserRepository, useClass: UserAdapter },
    //OLD
    UsersService,
    PrismaService,
    UserResolver,
    UnVerifiedUsersCleanUpCron,
    AuthUserReaderLocal,
    AuthUserWriterLocal,
  ],
  exports: [
    UserFacade,
    UserRepository,
    UsersService,
    AuthUserReaderLocal,
    AuthUserWriterLocal,
  ],
})
// export class UserModule implements OnModuleInit {
//   constructor(
//     private readonly CommandBus: CommandBus,
//     private readonly QueryBus: QueryBus,
//     private readonly EventBus: EventBus,
//   ) {}
//   onModuleInit() {
//     this.CommandBus.register(USER_COMMAND_HANDLERS);
//     this.QueryBus.register(USER_QUERY_HANDLERS);
//     this.EventBus.register(USER_EVENT_HANDLERS);
//   }
// }
export class UserModule {}
