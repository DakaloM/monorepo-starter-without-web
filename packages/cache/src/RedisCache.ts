import {
  RedisClientType,
  createClient,
  RedisModules,
  RedisFunctions,
  RedisScripts,
} from '@redis/client';
import { PromiseOfOptional } from '@repo/utils';
import { Cache, TimeToLive } from '~/interface';

export class RedisCache implements Cache {
  static async fromURI(url: string) {
    const client = await createClient({
      url,
    });

    await client.connect();

    return new RedisCache(client);
  }

  private constructor(
    private readonly client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>,
  ) {}

  async set(key: string, value: string, ttl?: TimeToLive | undefined): Promise<void> {
    await this.client.set(key, value, {
      EX: ttl ? ttl?.amount * ttl?.value : undefined,
      NX: true,
    });
  }
  async get(key: string): PromiseOfOptional<string> {
    const value = await this.client.get(key);

    return value || undefined;
  }
  async remove(key: string): Promise<void> {
    await this.client.del(key);
  }
  async clear(): Promise<void> {
    await this.client.flushAll();
  }
}
