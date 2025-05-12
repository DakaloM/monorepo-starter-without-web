import { RedisCache } from '@num/cache/server';

import { config } from './config';
import './express';
import { logger } from './logger';
import { createServer } from './server';

(async function () {
  const server = await createServer(config.stage);

  await server.start(config.http.port, config.http.host);

  const routes = [
    { name: 'api/docs', emoji: '📝' },
    { name: 'graphql', emoji: '🚀' },
  ];
  routes.forEach(({ emoji, name }) => {
    logger.info(
      { version: config.version },
      `${emoji} Running at http://${config.http.host}:${config.http.port}/${name}`,
    );
  });

  async function shutdown() {
    try {
      await server.stop();
    } catch (err) {
      logger.error(err);
      process.exitCode = 1;
    } finally {
      process.exit();
    }
  }

  process.on('uncaughtException', (err) => {
    logger.error(err, 'Uncaught exception detected.');
    process.exit(1);
  });

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})();
