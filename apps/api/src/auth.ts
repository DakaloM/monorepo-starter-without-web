

import { verify } from 'argon2';
import { User } from '~/account';
import { UserRole, UserStatus } from '~/account/user';
import { Client, ClientScope } from '~/auth/client';
import { Token } from '~/auth/token';
import { Context } from '~/context';

/**
 * The `AuthContext` is part of the `RequestContext` and contains info about
 * the currently authenticated token with its client, identity, and user.
 */
export class AuthContext {
  user?: User;
  token?: Token;
  client?: Client;
  actorIds: string[] = [];

  /**
   * Initializes a new `AuthContext` (which is usually part of `Context`) based on
   * a provided `tokenString`.
   */
  public static async init(tokenString: string, ctx: Context): Promise<AuthContext> {
    const auth = new AuthContext();
    const token = await Token.fromString(tokenString, ctx);

    const userId = token?.userId;

    if (!userId) {
      return auth;
    }

    const user = await User.query(ctx.db).findById(token.userId);
    if (user) {
      auth.user = user;
      auth.actorIds = [user.id];
    }

    auth.token = token;

    return auth;
  }

  static async fromBasicAuth(token: string, ctx: Context): Promise<AuthContext> {
    const auth = new AuthContext();
    const [clientId, clientSecret] = Buffer.from(token, 'base64').toString().split(':');

    const client = await Client.query(ctx.db).findById(clientId);

    if (!client) {
      return auth;
    }

    const isAuthorized = await verify(client.secret, clientSecret);

    if (!isAuthorized) {
      return auth;
    }

    auth.client = client;

    return auth;
  }

  public isActiveUser(): boolean {
    return this.user?.status === UserStatus.Active;
  }

  public hasUserRole(role: UserRole): boolean {
    return  this.user?.role  === role;
  }

  public hasOneOfRole(roles: UserRole[]): boolean {
    const role = this.user?.role;
    if (!role) {
      return false;
    }

    return roles.includes(role);
  }

  isAuthClient(): boolean {
    return this.client?.scope.includes(ClientScope.Auth) || false;
  }

  static async fromAuthHeader(header: string, ctx: Context): Promise<AuthContext> {
    const [type, token] = header.split(/\s+/);
    const isBasic = type.toLowerCase() === 'basic';
    const isBearer = type.toLowerCase() === 'bearer';

    if (isBearer) {
      return AuthContext.init(token, ctx);
    }

    if (isBasic) {
      return AuthContext.fromBasicAuth(token, ctx);
    }

    return new AuthContext();
  }

  public static fromUserContext(context: UserContext): AuthContext {
    const { token } = context;
    const auth = new AuthContext();

    auth.token = token;

    return auth;
  }

  public static encodeAuthContext(context: UserContext): string {
    const userContextString = JSON.stringify(context).toString();
    const data = Buffer.from(userContextString).toString('base64');

    return data;
  }

  public static decodeAuthContext(contextString: string): UserContext {
    const userContextString = Buffer.from(contextString, 'base64').toString('utf-8');
    const context = JSON.parse(userContextString) as UserContext;

    return context;
  }

  update(user: User | Client) {
    if (user instanceof User) {
      this.user = user;
      this.actorIds = [user.id];
    } else {
      this.client = user;
    }
  }
}

export type AuthenticatedUser = Pick<User, 'id' | 'role'>;
export type UserContext = {
  token: Token;
  users: AuthenticatedUser[];
};
