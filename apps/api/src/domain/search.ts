import { builder } from '~/graphql/builder';

import { ObjectRef } from '@pothos/core';
import Objection, { Model } from 'objection';
import { isActiveUser } from '~/account/shield';

export type SearchEntity<T> = {
  items: T[];
  total: number;
  hasNext: boolean;
};

export const createPayload = <T>(name: string, type: ObjectRef<T, T>) => {
  const PayloadSchema = builder.objectRef<SearchEntity<T>>(name);
  PayloadSchema.implement({
    shield: isActiveUser,
    fields: (t) => ({
      items: t.expose('items', { type: [type], description: 'List of entity' }),
      total: t.exposeInt('total', { description: 'Total number of objects' }),
      hasNext: t.exposeBoolean('hasNext', { description: 'Whether there are more users' }),
    }),
  });

  return PayloadSchema;
};

interface PageInfo {
  page?: number | null;
  limit?: number | null;
}

export function applyPagination<T extends Model>(
  query: Objection.QueryBuilder<T, T[]>,
  pageInfo: PageInfo = {},
) {
  const page = Math.max(pageInfo.page || 1, 1);
  const limit = Math.min(pageInfo.limit || 20, 50);

  const offset = (page - 1) * limit;

  query.limit(limit).offset(offset);
}
