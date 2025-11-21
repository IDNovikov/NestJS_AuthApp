import IORedis, { RedisOptions } from 'ioredis';

export class RedisService {
  private client: IORedis;
  constructor(opts: RedisOptions) {
    this.client = new IORedis(opts);
  }
  get raw() {
    return this.client;
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const v = await this.client.get(key);
    return v ? (JSON.parse(v) as T) : null;
  }

  async set(key: string, value: unknown, ttlSec = 60) {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSec);
  }
  async del(key: string): Promise<any> {
    const deleted = await this.client.del(key);
    return deleted;
  }

  async getMany<T = unknown>(
    key: string,
  ): Promise<{ key: string; value: T | null }[]> {
    const pattern = `${key}:*`;
    let cursor = '0';
    const keys: string[] = [];

    do {
      const [newCursor, foundKeys] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = newCursor;
      keys.push(...foundKeys);
    } while (cursor !== '0');

    if (keys.length === 0) return [];

    const values = await this.client.mget(keys);

    return keys.map((key, i) => {
      const raw = values[i];
      let parsed: T;

      parsed = raw ? JSON.parse(raw) : null;

      return { key, value: parsed as T | null };
    });
  }

  async delMany(key: string): Promise<void> {
    const pattern = `${key}:*`;
    let cursor = '0';
    do {
      const [newCursor, foundKeys] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = newCursor;
      if (foundKeys.length > 0) {
        await this.client.del(...foundKeys);
      }
    } while (cursor !== '0');
  }
}
