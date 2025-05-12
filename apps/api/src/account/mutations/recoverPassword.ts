import { ForbiddenError } from '@num/serverkit';

import * as argon from 'argon2';
import { User } from '~/account/user';
import { createAuthTokens } from '~/auth/mutation/createAuthTokens';
import { Context } from '~/context';

type Args = {
  email: string;
  code: string;
  password: string;
};

export async function recoverPassword(args: Args, ctx: Context) {
  const { code, password, email } = args;

  const user = await User.query(ctx.db).findOne({
    email,
  });

  if (!user) {
    throw new ForbiddenError({});
  }

  const savedCode = await ctx.cache.get(email);

  const isValid = code === savedCode;

  if (!isValid) {
    throw new ForbiddenError({});
  }

  await ctx.cache.remove(user.email);

  await User.query(ctx.db)
    .findById(user.id)
    .patch({
      password: await argon.hash(password),
    });

  return createAuthTokens(user, ctx);
}
