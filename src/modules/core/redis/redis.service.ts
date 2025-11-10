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
  async del(key: string) {
    await this.client.del(key);
  }

  async getMany<T = unknown>(key: string): Promise<T[] | []> {
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

    //const keys = await this.client.keys(key);

    // if (!keys.length) return [];

    // let arr = new Map();
    // keys.forEach(async (val) => {
    //   const data = await this.client.get(val);
    //   arr.set(val, data);
    // });
    // return arr;
  }
}
