export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface SortConfigField {
  column: string;
  orders: SortOrder[];
  nulls?: 'last' | 'first';
}

export interface SortConfig {
  idColumn: string;
  fields: Record<string, SortConfigField>;
}
