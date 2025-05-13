import { createDatabase, dropDatabase, createDatabaseClient } from '@repo/datakit';
import { createLogger } from '@repo/serverkit';
import { resolve } from 'path';
import { config } from '~/config';
import { knexfile } from '~/knex';

export default async function globalSetup() {
  try {
    await createDatabase(config.db.url);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ECONNREFUSED') {
      console.error(
        'Failed to connect to the database server for testing. ' + 'Make sure it is running.',
      );
    }
    throw err;
  }

  const logger = createLogger({ level: 'info', name: 'globalSetup', pretty: true });

  const db = createDatabaseClient(knexfile, logger);

  const root = resolve(config.paths.root, 'dist/db');

  await db.migrate.latest({
    directory: resolve(root, 'migrations'),
    extension: 'js',
    loadExtensions: ['.js'],
  });

  // await db.seed.run({
  //   directory: resolve(root, 'seeds'),
  //   extension: 'js',
  //   loadExtensions: ['.js'],
  // });

  await db.destroy();

  return async () => {
    await dropDatabase(config.db.url);
  };
}
