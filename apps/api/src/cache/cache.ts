import { Cache as BaseCache, TimeToLive } from '@num/cache';
import { BaseModel } from '@num/datakit';
import { PromiseOfOptional } from '@num/utils';

import { Context } from '~/context';

export class Cache extends BaseModel {
  static tableName = 'cache';
  static idColumn = 'key';

  key: string;
  value: string;
  expiresAt: number | null;
}

export class DatabaseCache implements BaseCache {
  constructor(private readonly db: Context['db']) {}

  async set(key: string, value: string, expiresIn?: TimeToLive | undefined): Promise<void> {
    const v = expiresIn ? expiresIn.amount * expiresIn.value : null;
    const expiresAt = v ? Date.now() + v * 1000 : null;

    await Cache.query(this.db)
      .insert({
        key,
        value,
        expiresAt,
      })
      .onConflict('key')
      .merge(['value', 'expiresAt']);
  }

  async get(key: string): PromiseOfOptional<string> {
    const now = Date.now();
    const cache = await Cache.query(this.db).where('key', key).where('expiresAt', '>', now).first();

    return cache?.value ?? undefined;
  }

  async remove(key: string): Promise<void> {
    await Cache.query(this.db).deleteById(key);
  }

  async clear(): Promise<void> {
    await Cache.query(this.db).delete();
  }
}
