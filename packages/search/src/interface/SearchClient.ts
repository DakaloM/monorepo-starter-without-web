export type SearchItem = {
  id: string;
};

export type SearchFilter<T extends SearchItem> = {
  [K in keyof T]?: T[K] | T[K][];
};

export interface SearchClient<T extends SearchItem> {
  /**
   * Search the index for items matching the query.
   *
   * @param query - search query
   * @param limit - limit the number of results
   * @param filter - filter the results
   * @returns Search results matching the query
   */
  search(query: string, limit?: number, filter?: SearchFilter<SearchItem>): Promise<T[]>;
  /**
   * Add an item to the search index.
   *
   * @param item - item to add to the search index
   */
  add(item: T | T[]): Promise<void>;
  /**
   * Remove an item from the search index.
   *
   * @param id - id of the item to remove from the search index
   */
  remove(id: string | string[]): Promise<void>;
}
