import { User } from '~/account';
import { Token, TokenType } from '~/auth/token';
import { Context } from '~/context';

export async function createAuthTokens(user: User, ctx: Context) {
  const accessToken = Token.create({
    userId: user.id,
    expiresIn: 3600,
    type: TokenType.ACCESS_TOKEN,
  });

  const refreshToken = Token.create({
    userId: user.id,
    expiresIn: 3600 * 24 * 30,
    type: TokenType.REFRESH_TOKEN,
  });

  await Token.upsert(accessToken, { amount: 1, value: 3600 }, ctx);
  await Token.upsert(refreshToken, { amount: 1, value: 3600 * 24 * 30 }, ctx);

  return {
    accessToken: accessToken.id,
    refreshToken: refreshToken.id,
    expiresIn: accessToken.expiresIn,
    expiresAt: accessToken.expiresAt.toString(),
  };
}
