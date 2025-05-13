import { builder } from '~/graphql/builder';

import { or } from 'graphql-shield';
import { createUser } from '~/account/mutations';

import { isAdmin } from '../shield';
import {
  GenderSchema,
  IdentityTypeSchema,
  RaceSchema,
  TitleSchema,
  UserRoleSchema,
  UserSchema,
} from './user';

const CreateUserInputSchema = builder.inputType('CreateUserInput', {
  fields: (t) => ({
    idNumber: t.string({ required: true }),
    idType: t.field({ type: IdentityTypeSchema, required: true }),
    birthDate: t.field({ type: 'Date', required: true }),
    gender: t.field({ type: GenderSchema, required: true }),
    race: t.field({ type: RaceSchema, required: true }),
    title: t.field({ type: TitleSchema, required: true }),
    name: t.string({ required: true }),
    email: t.string({ required: true }),
    tenantId: t.string({ required: true }),
    surname: t.string({ required: true }),
    role: t.field({ type: UserRoleSchema, required: true }),
  }),
});

builder.mutationField('createUser', (t) =>
  t.field({
    shield: isAdmin,
    description: 'Creates a user',
    args: {
      input: t.arg({ type: CreateUserInputSchema, required: true }),
    },
    type: UserSchema,
    resolve: async (_root, { input: args }, ctx) => {
      return createUser(
        {
          idNumber: args.idNumber,
          idType: args.idType,
          birthDate: args.birthDate,
          gender: args.gender,
          race: args.race,
          title: args.title,
          email: args.email,
          name: args.name,
          surname: args.surname,
          tenantId: args.tenantId,
          role: args.role,
        },
        ctx,
      );
    },
  }),
);
