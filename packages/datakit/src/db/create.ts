import type { Logger } from '@num/logger';

import type { Knex as KnexTypes } from 'knex';
import Knex from 'knex';
import pg from 'pg';

export type DbClient = KnexTypes<Record<string, never>, unknown[]>;

const { Client } = pg;

export function createDatabaseClient(config: KnexTypes.Config, logger: Logger): DbClient {
  const knex = Knex(config);

  if (logger.isLevelEnabled('debug')) {
    knex.on('query-response', (data, query) => {
      logger.debug({
        sql: query.sql,
        bindings: query.bindings,
        rowCount: data.length,
      });
    });

    knex.on('query-error', (error, query) => {
      logger.error({
        sql: query.sql,
        bindings: query.bindings,
        error,
      });
    });
  }

  return knex;
}

async function setupClient(uri: string, name?: string) {
  const url = new URL(uri);

  const db = new Client({
    user: url.username,
    password: url.password,
    host: url.hostname,
    port: parseInt(url.port),
    database: 'postgres',
  });

  let database = name || url.pathname.slice(1);
  if (database.includes('?')) {
    database = database.substring(0, database.indexOf('?'));
  }
  return { database, db };
}

/**
 * Creates a database based on the current `config`. The function idempotent.
 */
export async function createDatabase(
  uri: string,
  name?: string,
): Promise<{ alreadyExisted: boolean }> {
  const { database, db } = await setupClient(uri, name);
  try {
    await db.connect();
    const result = await db.query(
      `SELECT * FROM pg_catalog.pg_database WHERE datname = '${database}'`,
    );

    if (result.rowCount === 0) {
      await db.query(`CREATE DATABASE "${database}"`);
    }

    return Promise.resolve({ alreadyExisted: result.rowCount > 0 });
  } finally {
    await db.end();
  }
}

/**
 * Drops a database based on the current `config`. The function idempotent.
 */
export async function dropDatabase(uri: string, name?: string): Promise<void> {
  const { database, db } = await setupClient(uri, name);
  try {
    await db.connect();
    await db.query(`DROP DATABASE "${database}"`);
  } finally {
    await db.end();
  }
}
