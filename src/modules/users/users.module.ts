import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RedisModule } from '../core/redis/redis.module';
import { PrismaService } from '../core/prisma/prisma.service';
import { UserResolver } from './users.resolver';
import { ScheduleModule } from '@nestjs/schedule';
import { UnVerifiedUsersCleanUpCron } from './cron/unVerifiedUsersCleanUp.job';
import { AuthUserReaderLocal } from './adapters/authUser-reader.adapter';
import { AuthUserWriterLocal } from './adapters/authUser-writer.adapter';

@Module({
  imports: [RedisModule, ScheduleModule.forRoot()],
  controllers: [UsersController],
  providers: [
    UsersService,
    PrismaService,
    UserResolver,
    UnVerifiedUsersCleanUpCron,
    AuthUserReaderLocal,
    AuthUserWriterLocal,
  ],
  exports: [UsersService, AuthUserReaderLocal, AuthUserWriterLocal],
})
export class UserModule {}
