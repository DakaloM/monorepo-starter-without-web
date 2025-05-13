import { createLogger } from '@repo/logger';
import assert from 'assert';
import { Knex } from 'knex';
import { v4 as uuid } from 'uuid';
import { createDatabaseClient } from '~/db/create';

export interface Environment {
  db?: Knex;
  id: string;
}

/**
 * Creates a new environment used for testing (e.g. the database and cache
 * connection).
 */
export async function createDataEnvironmentProvider(knexConfig: Knex.Config) {
  const logger = createLogger({ name: 'datakit', pretty: true, level: 'error' });
  return async (options: CreateEnvConfig): Promise<Environment> => {
    const config = Object.assign({ db: true }, options);
    const env: Partial<Environment> = { id: uuid() };

    if (config.db) {
      env.db = createDatabaseClient(knexConfig, logger);
    }

    return env as Environment;
  };
}

/**
 * Destroys an environment used for testing (e.g. closes connections to the
 * database or cache).
 */
export async function destroyDataEnv(env: Environment): Promise<void> {
  assert.ok(env, 'Cannot destroy an invalid environment.');

  if (env.db) {
    await env.db.destroy();
  }
}

interface CreateEnvConfig {
  db?: boolean;
  cache?: boolean;
}
