import * as env from 'env-var';
import { MeiliSearch, Index } from 'meilisearch';
import { SearchClient, SearchFilter, SearchItem } from '~/interface/SearchClient';

export class MeiliSearchClient<T extends SearchItem> implements SearchClient<T> {
  private readonly index: Index<T>;
  readonly _client: MeiliSearch;

  static getOptions(options: MeiliSearchClientOptions) {
    const host = options.host ?? env.get('MEILISEARCH_HOST').required().asString();
    const key = options.key ?? env.get('MEILI_MASTER_KEY').required().asString();

    return {
      key,
      host,
    };
  }

  constructor(index: string, options: MeiliSearchClientOptions = {}) {
    const { host, key } = MeiliSearchClient.getOptions(options);

    const client = new MeiliSearch({
      host,
      apiKey: key,
    });

    this._client = client;

    this.index = client.index<T>(index);
  }

  async search(
    query: string,
    limit?: number,
    _filter?: SearchFilter<SearchItem> | undefined,
  ): Promise<T[]> {
    const { hits } = await this.index.search(query, { limit });

    return hits;
  }

  async add(item: T | T[]): Promise<void> {
    const items = Array.isArray(item) ? item : [item];

    await this.index.addDocuments(items);
  }

  async remove(id: string | string[]): Promise<void> {
    const ids = Array.isArray(id) ? id : [id];

    await this.index.deleteDocuments(ids);
  }
}

export interface MeiliSearchClientOptions {
  /**
   *  MeiliSearch host. Loads from environment variable `MEILISEARCH_HOST` by default.
   */
  host?: string;
  /**
   * MeiliSearch API key, loads from environment variable `MEILISEARCH_API_KEY` by default.
   */
  key?: string;
}
