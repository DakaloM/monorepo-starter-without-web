import DataLoader from 'dataloader';
import { Context } from '~/context';

import { Type } from '../type';

/**
 * DataLoader that loads types by ID.
 */
export function loadTypesById(ctx: Context): DataLoader<string, Type | null> {
  return new DataLoader(async (ids: readonly string[]) => {
    const results = await Type.query(ctx.db).whereIn('id', ids as string[]);

    if (ctx.loaders.types.byIdentifier) {
      for (const result of results) {
        if (result.identifier) {
          ctx.loaders.types.byIdentifier.prime(result.identifier, result);
        }
      }
    }

    return ids.map((id) => results.find((o) => o.id === id) || null);
  });
}
