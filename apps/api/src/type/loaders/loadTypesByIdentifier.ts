import DataLoader from 'dataloader';
import { Context } from '~/context';

import { Type, TypeIdentifier } from '../type';

/**
 * DataLoader that loads types by ID.
 */
export function loadTypesByIdentifier(ctx: Context): DataLoader<string, Type | null> {
  return new DataLoader(async (identifiers: readonly TypeIdentifier[]) => {
    const results = await Type.query(ctx.db).whereIn('identifier', identifiers);

    if (ctx.loaders.types.byId) {
      for (const result of results) {
        if (result.identifier) {
          ctx.loaders.types.byId.prime(result.id, result);
        }
      }
    }

    return identifiers.map(
      (identifier) => results.find((o) => o.identifier === identifier) || null,
    );
  });
}
