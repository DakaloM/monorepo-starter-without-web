import Objection from 'objection';

export enum FilterOperation {
  AND = 'AND',
  EQUAL = 'EQUAL',
  IN = 'IN',
  IS_SET = 'IS_SET',
  LIKE = 'LIKE',
  OR = 'OR',
}

export type FilterField = string | string[];

export type FilterAnd = [op: FilterOperation.AND, children: Filter[]];
export type FilterOr = [op: FilterOperation.OR, children: Filter[]];

export type FilterEqual = [
  op: FilterOperation.EQUAL,
  field: FilterField,
  value: string | number | Date,
];

export type FilterIsSet = [op: FilterOperation.IS_SET, field: FilterField];

export type FilterLike = [op: FilterOperation.LIKE, field: FilterField, value: string];
export type FilterIn<Value = string | number | { id: string }> = [
  op: FilterOperation.IN,
  field: FilterField,
  value: Value[],
];

export type Filter = FilterAnd | FilterEqual | FilterIn | FilterIsSet | FilterLike | FilterOr;

export type FilterConfigFieldDate = { column: string; type: 'date' };
export type FilterConfigFieldInt = { column: string; type: 'int' };
export type FilterConfigFieldRelation = {
  type: 'relation';
  relation: string;
  column?: string;
};
export type FilterConfigFieldString = { column: string; type: 'string' };
export type FilterConfigField =
  | FilterConfigFieldDate
  | FilterConfigFieldInt
  | FilterConfigFieldRelation
  | FilterConfigFieldString;

export interface FilterConfig {
  relations: Objection.Relations;
  fields: Record<string, FilterConfigField>;
}
