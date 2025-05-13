import { GetObjectPath, getArray } from '@repo/utils';
import Fuse from 'fuse.js';
import { SearchClient, SearchFilter, SearchItem } from '~/interface/SearchClient';

export class InMemorySearchClient<T extends SearchItem> implements SearchClient<T> {
  private cache: Record<string, T> = {};
  private items: T[] = [];

  constructor(private readonly keys: GetObjectPath<T>[]) {}

  async search(
    query: string,
    limit = 10,
    _filter?: SearchFilter<SearchItem> | undefined,
  ): Promise<T[]> {
    const results = this.client.search(query, { limit });

    return results.map((result) => result.item);
  }

  private get client() {
    return new Fuse(this.items, {
      keys: this.keys,
    });
  }

  async add(item: T | T[]): Promise<void> {
    const items = getArray(item);

    items.forEach((item) => {
      this.cache[item.id] = item;
    });

    this.items = Object.values(this.cache);
  }

  async remove(id: string | string[]): Promise<void> {
    const ids = getArray(id);

    ids.forEach((id) => {
      delete this.cache[id];
    });

    this.items = Object.values(this.cache);
  }

  async flush(): Promise<void> {
    this.cache = {};
    this.items = [];
  }
}
