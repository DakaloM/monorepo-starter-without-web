import assert from 'assert';
import { Knex } from 'knex';

export async function createDatabaseContext(
  env: DatabaseEnvironment,
  options?: Options,
): Promise<Knex> {
  const config = Object.assign({ wrapDbInTransaction: true }, options);

  let db = env.db as Knex;
  if (env.db && config.wrapDbInTransaction) {
    db = await db.transaction();
  }

  return db;
}

export async function destroyDatabaseContext(ctx: DatabaseContext): Promise<void> {
  assert.ok(ctx, 'Cannot destroy an invalid context');

  if (ctx.db && (ctx.db as Knex.Transaction).isTransaction) {
    await (ctx.db as Knex.Transaction).rollback();
  }
}

export interface Options {
  wrapDbInTransaction: boolean;
}

export interface DatabaseContext {
  db: Knex;
}

export interface DatabaseEnvironment {
  db?: Knex;
}
