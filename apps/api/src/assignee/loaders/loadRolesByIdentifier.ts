import DataLoader from 'dataloader';
import { Context } from '~/context';

import { Role, RoleIdentifier } from '../role';

/**
 * DataLoader that loads types by ID.
 */
export function loadRolesByIdentifier(ctx: Context): DataLoader<string, Role | null> {
  return new DataLoader(async (identifiers: readonly RoleIdentifier[]) => {
    const results = await Role.query(ctx.db).whereIn('identifier', identifiers);

    if (ctx.loaders.roles.byId) {
      for (const result of results) {
        if (result.identifier) {
          ctx.loaders.roles.byId.prime(result.id, result);
        }
      }
    }

    return identifiers.map(
      (identifier) => results.find((o) => o.identifier === identifier) || null,
    );
  });
}
