import middy, { MiddlewareObj } from '@middy/core';
import { CacheProvider } from '@repo/cache/server';

import { APIGatewayEventV2, Handler } from './core';

export function addCache(options: CacheOptions): MiddlewareObj<APIGatewayEventV2> {
  return {
    before: async (request) => {
      request.event.cache = await CacheProvider.fromURI(options.uri);
    },
  };
}

export function withCacheMiddleware<TBody, TRes>(
  handler: Handler<TBody, TRes>,
  options: CacheOptions,
) {
  return middy(handler).use(addCache(options));
}

interface CacheOptions {
  uri: string;
}
