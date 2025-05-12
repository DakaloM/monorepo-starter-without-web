import { SortConfig } from './sort';

export type PaginationConfig = {
  idColumn: string | string[];
  sort?: SortConfig['fields'];
  limit: {
    max: number;
    defaultValue: number;
  };
};
