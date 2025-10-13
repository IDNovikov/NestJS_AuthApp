import { Injectable } from '@nestjs/common';
import { DomainEvent, EventBus } from '../ports/event-bus.port';

@Injectable()
export class NoopEventBus implements EventBus {
  async publish(_: DomainEvent): Promise<void> {
    // ничего не делаем (крючок для ClickHouse/Kafka позже)
  }
}
