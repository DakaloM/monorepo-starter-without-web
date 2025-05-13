import { createDatabaseContext, destroyDatabaseContext } from '@repo/datakit';
import assert from 'assert';
import { DatabaseCache } from '~/cache/cache';
import { Context } from '~/context';
import { mailer } from '~/mailer';
import { storageClient } from '~/storage';

import { Environment } from './environment';
import { contexts } from './globals';

export async function createContext(env: Environment): Promise<Context> {
  const db = await createDatabaseContext({
    db: env.db,
  });

  const cache = new DatabaseCache(db);

  const ctx = Context.init({ db, cache, mailer, storageClient });

  contexts.set(ctx.id, ctx);

  return ctx;
}

export async function destroyContext(ctx: Context): Promise<void> {
  assert.ok(ctx, 'Cannot destroy an invalid context');

  await destroyDatabaseContext(ctx);
}

interface Options {
  wrapDbInTransaction: boolean;
}
