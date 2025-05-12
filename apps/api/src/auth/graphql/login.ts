import { builder } from '~/graphql/builder';

import { login } from '~/auth/mutation';

import { isAuthClient } from '../shield';
import { TokensRef } from './tokens';

builder.mutationField('login', (t) =>
  t.field({
    shield: isAuthClient,
    description: 'Authenticates a user',
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
    },
    type: TokensRef,
    resolve: async (_root, args, ctx) => {
      return login(args, ctx);
    },
  }),
);

// builder.mutationField('refresh', (t) =>
//   t.field({
//     shield: isAuthClient,
//     description: 'Authenticates a user',
//     args: {
//       refreshToken: t.arg.string({ required: true }),
//     },
//     type: TokensRef,
//     resolve: async (_root, args, ctx) => {
//       return login(args, ctx);
//     },
//   }),
// );
