//здесь запускаем воркеры ???
export interface QueuePort<Job = any> {
  enqueue(queue: string, job: Job): Promise<void>;
}
