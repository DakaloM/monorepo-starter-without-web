import Objection, { Model } from 'objection';
import { Context } from '~/context';

import { RoleIdentifier } from '../role';

export function applyConfidential<T extends Model>(
  query: Objection.QueryBuilder<T, T[]>,
  alias: string,
  ctx: Context,
) {
  query
    .select(`${alias}.*`)
    .distinctOn(`${alias}.id`)
    .fullOuterJoin('assignee', (queryBuilder) => {
      queryBuilder.on((qB) => {
        qB.onVal(`${alias}.confidential`, '=', true);
        qB.andOn('assignee.refId', '=', `${alias}.id`);
        qB.andOnIn('assignee.objectId', ctx.auth.actorIds);
      });
    })
    .andWhere((qB) => {
      qB.where(`${alias}.confidential`, '=', false).orWhereNotNull('assignee.id');
    });

  return query;
}

export function getConfidentialAssignees(
  { assignees, confidential }: ConfidentialAssigneeInput,
  ownerId: string,
) {
  const data = [{ id: ownerId, role: RoleIdentifier.Owner }];
  if (confidential) {
    data.push(...assignees.map((assignee) => ({ id: assignee, role: RoleIdentifier.Assignee })));
  }

  return data;
}

interface ConfidentialAssigneeInput {
  confidential: boolean;
  assignees: string[];
}
