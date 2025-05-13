import { builder } from '~/graphql/builder';

import { UserSchema } from '~/account/graphql';
import { isActiveUser } from '~/account/shield';
import { Assignee } from '~/assignee';
import { getAssigneesByRef } from '~/assignee/queries';
import { TypeIdentifier } from '~/type/type';

import { getRoleIdentityByRoleId } from '../query';
import { RoleIdentifier } from '../role';

export const TypeIdentifierType = builder.enumType(TypeIdentifier, {
  name: 'TypeIdentifier',
  description: 'Assignee ref type',
});

export const RoleIdentifierType = builder.enumType(RoleIdentifier, {
  name: 'RoleIdentifier',
  description: 'Assignee role',
});

export const AssigneeType = builder.objectType(Assignee, {
  name: 'Assignee',
  shield: isActiveUser,
  description:
    'Assignee represents a user who has been assigned to a resource for a specified role',
  interfaces: [],
  fields: (t) => ({
    id: t.exposeID('id'),
    role: t.field({
      type: 'String',
      resolve: (root, _, ctx) => getRoleIdentityByRoleId(root.roleId, ctx),
    }),
    user: t.expose('user', {
      type: UserSchema,
      nullable: true,
    }),
  }),
});

export const HasAssigneesType = builder.interfaceType('HasAssignees', {
  description: 'An object that can have users and/or groups with roles assigned to it.',
  fields: (t) => ({
    assignees: t.field({
      type: [AssigneeType],
      args: {},
      description: 'The list of the assignees of the object.',
      resolve: async (root, args, ctx) => {
        const assignees = await getAssigneesByRef(root.id, ctx);

        return assignees;
      },
    }),
  }),
});
