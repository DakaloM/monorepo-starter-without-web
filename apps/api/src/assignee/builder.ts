import { createBuilder, createSeed } from '@repo/datakit';
import { createObjectMap } from '@repo/utils';

import { Assignee } from './assignee';
import { Role } from './role';
import { roles } from './seeds';

export const assigneeBuilder = createBuilder(async (attrs: Partial<Assignee>, _factory, _ctx) => {
  return Assignee.fromJson({
    ...attrs,
  });
});

export const roleSeeds = createSeed(async (__, _, ctx) => {
  const data = await Role.query(ctx.db).insert(roles);

  return createObjectMap(data, ({ identifier }) => identifier);
});
