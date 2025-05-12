import { builder } from '~/graphql/builder';

import { allow } from 'graphql-shield';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export const TokensRef = builder.objectRef<Tokens>('Tokens');

TokensRef.implement({
  shield: allow,
  fields: (t) => ({
    accessToken: t.exposeString('accessToken'),
    refreshToken: t.exposeString('refreshToken'),
    expiresAt: t.exposeString('expiresAt'),
  }),
});
