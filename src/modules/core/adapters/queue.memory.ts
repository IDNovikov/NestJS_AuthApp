import { Injectable } from '@nestjs/common';
import { QueuePort } from '../ports/queue.port';

@Injectable()
export class MemoryQueue implements QueuePort {
  async enqueue(queue: string, job: any): Promise<void> {
    // имитация очереди
    setTimeout(() => {
      console.log(() => console.log(`🧰 [queue:${queue}] job=`, job));
    }, 0);
  }
}
