import { Cache } from '@num/cache';
import { createDatabaseClient } from '@num/datakit';

import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Knex } from 'knex';
import { DatabaseCache } from '~/cache/cache';
import { config } from '~/config';
import { Context } from '~/context';
import { knexfile } from '~/knex';
import { logger } from '~/logger';
import { mailer } from '~/mailer';
import { storageClient } from '~/storage';
import { contexts } from '~/test/globals';

export enum Headers {
  CONTEXT_ID = 'x-num-test-context-id',
}

/**
 * Creates a middleware that re-uses a context across requests in a testing
 * environment. This enables sharing a transaction across tests.
 */
function createTestContextMiddleware(): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const contextId = req.headers[Headers.CONTEXT_ID] as string;

    const sharedCtx = contexts.get(contextId);
    if (!sharedCtx) {
      throw new Error(`Failed to accquire context "${contextId}".`);
    }

    if (!sharedCtx.db || !sharedCtx.cache) {
      throw new Error(`Missing db/cache prop from shared context.`);
    }

    const ctx = Context.init(sharedCtx as Context);

    req.ctx = ctx;
    return next();
  };
}

function baseCreateContextMiddleware(): RequestHandler {
  let db: Knex | null = null;
  let cache: Cache | null = null;

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!db) {
      db = createDatabaseClient(knexfile, logger);
    }
    if (!cache) {
      cache = new DatabaseCache(db);
    }

    const ctx = await Context.init({ cache, db, mailer, storageClient });

    req.ctx = ctx;
    return next();
  };
}

export function createContextMiddleware(): RequestHandler {
  if (config.env === 'test') {
    return createTestContextMiddleware();
  }

  return baseCreateContextMiddleware();
}
