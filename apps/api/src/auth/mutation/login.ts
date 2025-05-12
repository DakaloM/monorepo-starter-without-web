import { ForbiddenError } from '@num/serverkit';

import * as argon from 'argon2';
import { User } from '~/account';
import { Context } from '~/context';

import { createAuthTokens } from './createAuthTokens';

type CreateUserInput = {
  email: string;
  password: string;
};

export async function login(input: CreateUserInput, ctx: Context) {
  const user = await User.query(ctx.db).findOne({ email: input.email });

  if (!user?.password) {
    throw new ForbiddenError({
      message: 'Invalid credentials',
    });
  }

  const isValid = await argon.verify(user.password, input.password);

  if (!isValid) {
    throw new ForbiddenError({
      message: 'Invalid credentials',
    });
  }

  return createAuthTokens(user, ctx);
}
