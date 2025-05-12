import { Handler, APIGatewayEventV2 } from '@num/serverlesskit';

import middy, { MiddlewareObj } from '@middy/core';
import knex from 'knex';
import { AuthContext } from '~/auth';
import { DatabaseCache } from '~/cache/cache';
import { Context } from '~/context';
import { knexfile } from '~/knex';
import { mailer } from '~/mailer';
import { storageClient } from '~/storage';

const db = knex(knexfile);
export function addContext<TEvent extends ContextEvent>(): MiddlewareObj<TEvent> {
  return {
    before: async (request) => {
      const header = request.event.headers['authorization'] || '';
      const token = header.replace('Bearer ', '');

      const ctx = Context.init({
        db,
        mailer: mailer,
        cache: new DatabaseCache(db),
        storageClient,
      });

      const auth = await AuthContext.init(token, ctx);

      ctx.auth = auth;

      request.event.ctx = ctx;
    },
  };
}

export function withContext<TBody, TRes>(handler: Handler<TBody, TRes>) {
  return middy(handler).use(addContext());
}

export type ContextEvent = APIGatewayEventV2 & {
  ctx: Context;
};
