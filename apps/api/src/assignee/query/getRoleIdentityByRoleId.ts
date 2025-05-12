import { NotFoundError } from '@num/serverkit';

import { Context } from '~/context';

import { Role } from '../role';

export async function getRoleIdentityByRoleId(id: string, ctx: Context) {
  const role = await Role.query(ctx.db).findById(id);
  if (!role) throw new NotFoundError({ message: 'Role not found' });

  return role.identifier;
}
