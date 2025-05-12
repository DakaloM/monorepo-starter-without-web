import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { GraphQLError } from 'graphql';
import http from 'http';
import { useSofa as exposeSofaApi, OpenAPI } from 'sofa-api';
import { Context } from '~/context';
import { createAuthContextMiddleware, createContextMiddleware } from '~/middleware/context';
import { errorMiddleware } from '~/middleware/errors';
import { schema } from '~/schema';

import { Stage } from './config';
import { logger } from './logger';

export function createApolloServer(stage: Stage) {
  const openApi = OpenAPI({
    schema,
    info: {
      title: 'Example API',
      version: '3.0.0',
    },
  });

  const gql = new ApolloServer<Context>({
    schema,
    formatError: (err) => {
      if (stage === 'prod' && err.extensions?.code === 'INTERNAL_SERVER_ERROR') {
        logger.error(err);

        const error = new GraphQLError(
          'The server encountered an internal error. Please retry the request.',
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
            },
          },
        );

        return error;
      }
      return err;
    },
  });

  return { gql, openApi };
}

export async function createServer(stage: Stage): Promise<Server> {
  const app = express();
  const httpServer = http.createServer(app);

  const { gql } = createApolloServer(stage);

  app.use(cors());

  app.use(bodyParser.json({ limit: '500kb' }));

  gql.addPlugin(ApolloServerPluginDrainHttpServer({ httpServer }));

  app.use(createContextMiddleware());
  app.use(createAuthContextMiddleware());

  await gql.start();
  app.use(
    '/graphql',
    expressMiddleware<Context>(gql, {
      context: async ({ req }) => {
        return req.ctx as Context;
      },
    }),
  );

  app.use(
    '/api',
    exposeSofaApi({
      schema,
      basePath: '/api',
      routes: {
        'Mutation.createAccount': {
          method: 'POST',
          path: '/auth/register',
        },
        'Mutation.login': {
          method: 'POST',
          path: '/auth/login',
        },
      },
      openAPI: {
        info: {
          title: 'Example API',
          version: '3.0.0',
        },
        endpoint: '/openapi.json',
      },
      swaggerUI: {
        endpoint: '/docs',
      },
    }),
  );

  // app.use('/docs', swaggerUI.serve, swaggerUI.setup(openApi.get()));

  app.all('/-/health', async (req, res) => {
    // TODO: Check database connection
    res.send('OK');
  });

  app.use(errorMiddleware());

  return {
    http: httpServer,
    app,
    gql,
    start: (port?: number, hostname?: string) =>
      new Promise<void>((resolve) => {
        httpServer.listen({ port, hostname }, resolve);
      }),
    stop: async () => {
      await gql.stop();
      httpServer.close();
    },
  };
}

export type Server = {
  http: http.Server;
  gql: ApolloServer<Context>;
  app: express.Express;
  start: (port?: number, hostname?: string) => Promise<void>;
  stop: () => Promise<void>;
};

interface Options {
  stage: Stage;
  port?: number;
  hostname?: string;
}
