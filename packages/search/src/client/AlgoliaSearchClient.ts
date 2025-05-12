import algolia, { SearchIndex, SearchClient as IAlgoliaSearchClient } from 'algoliasearch';
import { SearchClient, SearchFilter, SearchItem } from '~/interface/SearchClient';

export class AlgoliaSearchClient<T extends SearchItem> implements SearchClient<T> {
  private readonly index: SearchIndex;
  readonly _client: IAlgoliaSearchClient;

  constructor(index: string, applicationId: string, apiKey: string) {
    this._client = algolia(applicationId, apiKey);
    this.index = this._client.initIndex(index);
  }

  static toEntry<T extends SearchItem>(item: T): T & { objectID: string } {
    return {
      objectID: item.id,
      ...item,
    };
  }

  static toFilter<T extends SearchItem>(filter: SearchFilter<T>): FilterValue<T>[] {
    const filters: FilterValue<T>[] = [];
    const keys = Object.keys(filter) as (keyof T)[];
    keys.forEach((key) => {
      const value = filter[key];
      const k = key.toString();
      if (Array.isArray(value)) {
        value.forEach((v) => {
          filters.push(`${k}:${v}` as FilterValue<T>);
        });
      } else {
        filters.push(`${k}:${value}` as FilterValue<T>);
      }
    });

    return filters;
  }

  async search(
    query: string,
    limit: number = 100,
    filter?: SearchFilter<SearchItem> | undefined,
  ): Promise<T[]> {
    const response = await this.index.search<T>(query, {
      facetFilters: AlgoliaSearchClient.toFilter(filter ?? {}),
      hitsPerPage: limit,
    });

    return response.hits;
  }

  async add(item: T | T[]): Promise<void> {
    const items = Array.isArray(item) ? item : [item];

    await this.index.saveObjects(items.map(AlgoliaSearchClient.toEntry));
  }

  async remove(id: string | string[]): Promise<void> {
    const ids = Array.isArray(id) ? id : [id];

    await this.index.deleteObjects(ids);
  }
}

type FilterValue<T extends SearchItem> = {
  // @ts-ignore
  [K in keyof T]: `${K}:${T[K]}`;
}[keyof T];
