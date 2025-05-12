import { rule } from 'graphql-shield';
import { compact } from 'lodash';
import { Context } from '~/context';

import { Assignee } from '../assignee';
import { Role, RoleIdentifier } from '../role';

const getAssignee = (id: string, ctx: Context) => {
  return Assignee.query(ctx.db).whereIn('objectId', ctx.auth.actorIds).where({ refId: id });
};

export const isAssignee = rule({ cache: 'contextual' })(async (parent, args, ctx: Context) => {
  const id = args.id || args.input?.id;

  if (!id) {
    return false;
  }

  const assignee = await getAssignee(id, ctx).first();

  return Boolean(assignee);
});

const createAssigneeRoleRule = (identifiers: RoleIdentifier[]) =>
  rule({ cache: 'contextual' })(async (_, args, ctx: Context) => {
    const id = args.id || args.input?.id || args.refId || args.input?.refId;

    if (!id) {
      return false;
    }

    const roles = compact(await ctx.loaders.roles.byIdentifier.loadMany(identifiers)).filter(
      (role) => role instanceof Role,
    ) as Role[];

    const ids = roles.map((role) => role.id);

    const assignee = await getAssignee(id, ctx).whereIn('roleId', ids).first();

    return Boolean(assignee);
  });

export const isOwner = createAssigneeRoleRule([RoleIdentifier.Owner]);
export const isCollaborator = createAssigneeRoleRule([
  RoleIdentifier.Collaborator,
  RoleIdentifier.Owner,
]);
