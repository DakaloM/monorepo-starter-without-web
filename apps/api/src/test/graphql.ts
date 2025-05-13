import { gql as baseGql } from '@apollo/client';
import { ExpiresInSeconds } from '@repo/cache';
import { has } from 'lodash';
import { agent } from 'supertest';
import type { Variables } from 'supertest-graphql';
import { SuperTestExecutionResult, SuperTestGraphQL } from 'supertest-graphql';
import { Token } from '~/auth/token';
import { Context } from '~/context';
import { Headers } from '~/middleware/context';

import { Environment } from './environment';

class GraphQLRequest<TData> extends SuperTestGraphQL<TData, Variables> {
  private ctx: Context | null = null;
  private assertNoMutationErrorsAt: string | null = null;

  /**
   * Sets the `ctx` of this request.
   */
  withContext(ctx: Context): this {
    this.ctx = ctx;

    this.set(Headers.CONTEXT_ID, ctx.id);
    return this;
  }

  /**
   * Assert that there is no errors (`.errors` field) in response returned from the GraphQL API.
   */
  expectNoMutationErrors(key = 'mutation'): this {
    this.assertNoMutationErrorsAt = key;
    return this;
  }

  /**
   * Overrides `super.end()` to accquire the authentication token before sending
   * the request.
   */
  async end(): Promise<SuperTestExecutionResult<TData>> {
    if (this.ctx) {
      if (!this.ctx.auth.user && !this.ctx.auth.client) {
        throw new Error('Cannot call `withContext` with an unauthenticated context.');
      }

      if (this.ctx.auth.user) {
        const token = Token.create({
          userId: this.ctx.auth.user.id,
        });

        await Token.upsert(
          token,
          {
            amount: 1,
            value: ExpiresInSeconds.OneHour,
          },
          this.ctx,
        );

        this.auth(token.id, { type: 'bearer' });
      }

      if (this.ctx.auth.client) {
        const { id, raw } = this.ctx.auth.client;

        this.auth(id, raw as string, { type: 'basic' });
      }
    }

    const result = await super.end();

    if (this.assertNoMutationErrorsAt) {
      assertNoMutationErrors(result.data as {}, this.assertNoMutationErrorsAt);
    }

    return result;
  }
}

/**
 * A small wrapper around `supertest` that automatically sets the server
 * from the `env` and optionally creates a token for `ctx` (via `withContext`).
 */
export function request<TData = any>(env: Environment): GraphQLRequest<TData> {
  if (!env.server) {
    throw new Error(
      `Unable to send a request in an environment without a server. ` +
        `Make sure to set "server: true" in "createEnv()" in your test.`,
    );
  }
  return new GraphQLRequest(agent(env.server.http));
}

export const gql = baseGql;

type MutationError = {
  code: string;
  message: string;
  path: string[];
  type: string;
};

/**
 * Asserts that a GraphQL response does not contain mutation errors. Mutation
 * errors
 */
function assertNoMutationErrors(
  data: { [key: string]: { errors?: MutationError[] } },
  key: string,
): void {
  if (!has(data, key)) {
    throw new Error(`Expected a mutation payload. Did you alias the mutation to "${key}"?`);
  }
  if (!has(data[key], 'errors')) {
    throw new Error(
      `Expected an empty errors prop in mutation. ` +
        `Did you select the "errors" field in "${key}"?`,
    );
  }

  const errors = data[key].errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const summary = errors
      .map((e) => `- ${e.type}: ${e.code}: ${e.message} (${e.path.join('.')})`)
      .join('\n');

    throw new Error(
      `Expected no mutation errors but got ${errors.length} error(s) ` +
        `in GraphQL response at "${key}": \n\n${summary}`,
    );
  }
}
