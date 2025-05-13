import { TimeToLive } from '@repo/cache';
import * as crypto from 'node:crypto';
import { Context } from '~/context';

export enum TokenType {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
}

export interface TokenProps {
  expiresIn: number;
  id: string;
  userId: string;
  scopes: string[];
  type: TokenType;
}

export const DEFAULT_TOKEN_TTL = 60 * 60 * 8;
export const DEFAULT_TOKEN_LENGTH = 32;

/**
 * An authentication token.
 */
export class Token implements TokenProps {
  expiresAt: number;
  expiresIn: number;
  id: string;
  userId: string;
  scopes: string[] = [];
  type: TokenType = TokenType.ACCESS_TOKEN;
  clientId: string;

  static fields: readonly string[] = [
    'clientId',
    'expiresIn',
    'id',
    'userId',
    'scopes',
    'type',
  ] as const;

  static createRefreshToken() {
    return crypto
      .randomBytes(DEFAULT_TOKEN_LENGTH)
      .toString('base64')
      .slice(0, DEFAULT_TOKEN_LENGTH);
  }

  static createAccessToken() {
    return Token.createRefreshToken(); //TODO should return jwt token containing identityId
  }

  /**
   * Creates a new token with sensible defaults.
   */
  static create(fields: CreateTokenParams): Token {
    const token = new Token();

    const isRefreshToken = fields.type === TokenType.REFRESH_TOKEN;
    token.id = isRefreshToken ? Token.createRefreshToken() : Token.createAccessToken();

    token.userId = fields.userId;
    token.type = fields.type || TokenType.ACCESS_TOKEN;
    const expiresIn = typeof fields.expiresIn === 'number' ? fields.expiresIn : DEFAULT_TOKEN_TTL;
    token.expiresIn = expiresIn;

    token.expiresAt = Date.now() + expiresIn * 1000;

    return token;
  }

  static async upsert(token: Token, ttl: TimeToLive, { cache }: Context): Promise<void> {
    const { id, ...data } = token;

    await cache.set(token.id, JSON.stringify(data), ttl);
  }

  static fromJson(fields: Record<(typeof Token.fields)[number], any>): Token {
    return Object.assign(
      new Token(),
      Object.keys(fields)
        .filter((field) => Token.fields.includes(field))
        .reduce(
          (acc, field) => ({ ...acc, [field]: fields[field] }),
          {} as Record<string, unknown>,
        ),
    );
  }

  static async fromString(id: string, ctx: Context): Promise<Token | undefined> {
    if (!id) return undefined;
    const str = await ctx.cache.get(id);

    if (!str) {
      return undefined;
    }
    return Token.fromJson({ ...JSON.parse(str), id });
  }
}

export type CreateTokenParams = {
  userId: string;
  expiresIn?: number;
  type?: TokenType;
};
