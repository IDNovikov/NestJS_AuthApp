import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../core/redis/redis.module';
import { PrismaService } from '../core/prisma/prisma.service';
import { UserResolver } from './users.resolver';

@Module({
  imports: [AuthModule, RedisModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, UserResolver],
  exports: [UsersService],
})
export class UserModule {}
