import { Module } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { RedisModule } from '../core/redis/redis.module';
import { DesksController } from './desks/desks.controller';
import { DesksService } from './desks/desks.service';
import { StickersGateway } from './desks.gateway';
import { StickersController } from './stickers/stickers.controller';
import { StickersService } from './stickers/stickers.service';

@Module({
  imports: [RedisModule],
  controllers: [StickersController, DesksController],
  providers: [StickersService, DesksService, PrismaService, StickersGateway],
  exports: [StickersService, DesksService],
})
export class DesksModule {}
