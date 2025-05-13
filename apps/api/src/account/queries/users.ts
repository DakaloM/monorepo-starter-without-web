import { InternalError } from '@repo/serverkit';
import { RoleIdentifier } from '~/assignee/role';
import { Context } from '~/context';
import { applyPagination } from '~/domain/search';

import { User } from '../user';

type Page = {
  page: number;
  limit: number;
};

type Search = Page;

export async function getUsers(search: Search, ctx: Context) {
  const { page = 1, limit = 20, ...filter } = search;

  const query = User.query(ctx.db);

  const countQuery = query.clone().count('user.id').groupBy('user.id');

  const count = await countQuery.first().resultSize();

  applyPagination(query, search);

  const users = (await query) as (User & { objectId?: string })[];

  return {
    items: users.map((user) => ({
      ...user,
      id: user.objectId || user.id,
    })) as User[],
    total: count,
    hasNext: users.length < limit,
  };
}
