import { builder } from '~/graphql/builder';

import { createPayload } from '~/domain/search';

import { getUsers } from '../queries';
import { isActiveUser } from '../shield';
import { UserRoleSchema, UserSchema } from './user';

export const UsersFilter = builder.inputType('UserFilter', {
  fields: (f) => ({
    role: f.field({ type: UserRoleSchema, required: false }),
    name: f.field({ type: 'String', required: false }),
    notRole: f.field({ type: UserRoleSchema, required: false }),
    refId: f.field({ type: 'String', required: false }),
  }),
});

const UsersPayloadSchema = createPayload('UsersPayload', UserSchema);

builder.queryField('users', (t) =>
  t.field({
    shield: isActiveUser,
    description: 'List of users',
    args: {
      limit: t.arg.int({ defaultValue: 20 }),
      page: t.arg.int({ defaultValue: 1 }),
      filter: t.arg({ required: false, type: UsersFilter }),
    },
    type: UsersPayloadSchema,
    resolve: async (_root, args, ctx) =>
      getUsers(
        {
          limit: args.limit || 20,
          page: args.page || 1,
          ...args.filter,
        },
        ctx,
      ),
  }),
);

interface Count {
  count: string;
}
