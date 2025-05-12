import { builder } from '~/graphql/builder';

import { forgotPassword, recoverPassword } from '~/account/mutations';
import { TokensRef } from '~/auth/graphql/tokens';
import { isAuthClient } from '~/auth/shield';

builder.mutationField('forgotPassword', (t) =>
  t.field({
    shield: isAuthClient,
    description: 'Initiate forgot password flow',
    args: {
      email: t.arg({ type: 'EmailAddress', required: true }),
    },
    type: 'String',
    resolve: async (_root, args, ctx) => {
      return forgotPassword(args, ctx);
    },
  }),
);

builder.mutationField('recoverPassword', (t) =>
  t.field({
    shield: isAuthClient,
    description: 'Complete forgot password flow',
    args: {
      email: t.arg({ type: 'EmailAddress', required: true }),
      code: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
    },
    type: TokensRef,
    resolve: async (_root, args, ctx) => {
      return recoverPassword(args, ctx);
    },
  }),
);
