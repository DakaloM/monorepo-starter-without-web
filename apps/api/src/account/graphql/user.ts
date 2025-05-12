import { builder } from '~/graphql/builder';

import { EnumRef, ValuesFromEnum } from '@pothos/core';
import { isActiveUser } from '~/account/shield';
import { Gender, IdentityType, Race, Title, User, UserRole } from '~/account/user';

import { getUserById } from '../queries';

export const UserRoleSchema = builder.enumType(UserRole, {
  name: 'UserRole',
  description: 'User role',
});

export const IdentityTypeSchema = builder.enumType(IdentityType, {
  name: 'IdentityType',
  description: 'Identity type',
});

export const GenderSchema = builder.enumType(Gender, {
  name: 'Gender',
  description: 'Gender',
});

export const RaceSchema = builder.enumType(Race, {
  name: 'Race',
  description: 'Race',
});

export const TitleSchema = builder.enumType(Title, {
  name: 'Title',
  description: 'Title',
});

export const UserSchema = builder.objectType(User, {
  name: 'User',
  shield: isActiveUser,
  description: 'A user is an human user or bot that can interact with the system.',
  interfaces: [],
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.field({
      type: 'EmailAddress',
      resolve: (root) => root.email,
    }),
    role: t.expose('role', { type: UserRoleSchema, description: 'The role of the user.' }),
    name: t.exposeString('name'),

    surname: t.exposeString('surname'),
    sequence: t.exposeInt('sequence'),
  }),
});

builder.queryField('user', (t) =>
  t.field({
    shield: isActiveUser,
    description: 'A user',
    args: {
      id: t.arg.id({ required: true }),
    },
    type: UserSchema,
    resolve: async (_root, args, ctx) => {
      return getUserById(args.id.toString(), ctx);
    },
  }),
);

builder.queryField('me', (t) =>
  t.field({
    shield: isActiveUser,
    description: 'A user',

    type: UserSchema,
    resolve: async (_root, args, ctx) => {
      const id = ctx.auth.user?.id.toString() || '';

      return getUserById(id, ctx);
    },
  }),
);
