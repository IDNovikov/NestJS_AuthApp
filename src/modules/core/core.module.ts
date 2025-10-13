import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConsoleNotifications } from './adapters/notifications.console';
import { MemoryQueue } from './adapters/queue.memory';
import { NoopEventBus } from './adapters/event-bus.noop';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [ConsoleNotifications, MemoryQueue, NoopEventBus],
  exports: [ConsoleNotifications, MemoryQueue, NoopEventBus],
})
export class CoreModule {}
