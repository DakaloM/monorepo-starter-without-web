import { rule } from 'graphql-shield';
import { Context } from '~/context';

export const isAuthClient = rule({ cache: 'contextual' })(async (parent, args, ctx: Context) => {
  return ctx.auth.isAuthClient();
});
