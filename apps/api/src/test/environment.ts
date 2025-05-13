import { createDataEnvironmentProvider, destroyDataEnv } from '@repo/datakit';
import assert from 'assert';
import crypto from 'node:crypto';
import { Context } from '~/context';
import { knexfile } from '~/knex';
import { createServer, Server } from '~/server';

export interface Environment {
  db?: Context['db'];
  id: string;
  server?: Server;
}

/**
 * Creates a new environment used for testing (e.g. the database and cache
 * connection).
 */
export async function createEnv(options: CreateEnvConfig = {}): Promise<Environment> {
  const config = Object.assign({ db: true, server: false }, options);
  const env: Partial<Environment> = { id: crypto.randomUUID() };

  const createDBEnv = await createDataEnvironmentProvider(knexfile);

  if (config.db) {
    const dbEnv = await createDBEnv({ db: true });
    env.db = dbEnv.db;
  }

  if (config.server) {
    env.server = await createServer('dev');
    env.server.start();
  }

  return env as Environment;
}

/**
 * Destroys an environment used for testing (e.g. closes connections to the
 * database or cache).
 */
export async function destroyEnv(env: Environment): Promise<void> {
  assert.ok(env, 'Cannot destroy an invalid environment.');

  if (env.db) {
    await destroyDataEnv(env);
  }

  await env.server?.stop();
}

interface CreateEnvConfig {
  db?: boolean;
  server?: boolean;
  cache?: boolean;
}
