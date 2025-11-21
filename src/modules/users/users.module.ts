import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../core/redis/redis.module';
import { PrismaService } from '../core/prisma/prisma.service';
import { UserResolver } from './users.resolver';
import { ScheduleModule } from '@nestjs/schedule';
import { UnVerifiedUsersCleanUpCron } from './cron/unVerifiedUsersCleanUp.job';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    RedisModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    PrismaService,
    UserResolver,
    UnVerifiedUsersCleanUpCron,
  ],
  exports: [UsersService],
})
export class UserModule {}
