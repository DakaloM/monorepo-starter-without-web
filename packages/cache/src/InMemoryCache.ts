import { PromiseOfOptional } from '@repo/utils';
import { Cache } from '~/interface';

export class InMemoryCache implements Cache {
  private db: Record<string, string | undefined> = {};
  async set(key: string, value: string): Promise<void> {
    this.db[key] = value;
  }
  async get(key: string): PromiseOfOptional<string> {
    return this.db[key];
  }
  async remove(key: string): Promise<void> {
    delete this.db[key];
  }
  async clear(): Promise<void> {
    this.db = {};
  }
}
