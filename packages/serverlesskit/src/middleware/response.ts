import middy, { MiddlewareObj } from '@middy/core';
import z from 'zod';

import { APIGatewayEventV2, Handler } from './core';

export function addResponse(): MiddlewareObj<APIGatewayEventV2> {
  return {
    after: async (request) => {
      const { body } = request.response;
      request.response.body = JSON.stringify(body);
    },
  };
}

export function withResponseMiddleware<TBody, TRes>(handler: Handler<TBody, TRes>) {
  return middy(handler).use(addResponse());
}

type Schema = z.AnyZodObject | z.ZodEffects<z.AnyZodObject>;
