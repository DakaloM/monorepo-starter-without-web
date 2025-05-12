import DataLoader from 'dataloader';
import { Context } from '~/context';

import { Role } from '../role';

/**
 * DataLoader that loads types by ID.
 */
export function loadRolesById(ctx: Context): DataLoader<string, Role | null> {
  return new DataLoader(async (ids: readonly string[]) => {
    const results = await Role.query(ctx.db).whereIn('id', ids as string[]);

    if (ctx.loaders.roles.byIdentifier) {
      for (const result of results) {
        if (result.identifier) {
          ctx.loaders.roles.byIdentifier.prime(result.identifier, result);
        }
      }
    }

    return ids.map((id) => results.find((o) => o.id === id) || null);
  });
}
