import { Context } from '~/context';

import { Assignee } from '../assignee';

/**
 * Returns a paginated list of assignees taking the `ctx` into account.
 */
export async function getAssigneesByRef(refId: string, ctx: Context): Promise<Assignee[]> {
  const assignees = await Assignee.query(ctx.db)
    .where({ refId })
    .distinctOn('assignee.objectId')
    .withGraphFetched('user.member')
    .withGraphFetched('tenant');

  return assignees;
}
