import serverless from 'serverless-http';
import { config } from '~/config';
import { createServer } from '~/server';

import { withContext } from '../middleware';

let serverlessHandler: serverless.Handler;
export const getHandler = async (event: Event): Promise<serverless.Handler> => {
  if (!serverlessHandler) {
    const server = await createServer(config.stage);
    serverlessHandler = serverless(server.app);
  }

  return serverlessHandler;
};

const main = async (event: Event) => {
  const handler = await getHandler(event);

  return handler(event, {});
};

export const handler = withContext(main);
