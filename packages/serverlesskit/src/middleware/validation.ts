import { BadRequestError } from '@num/errors';

import middy, { MiddlewareObj } from '@middy/core';
import z from 'zod';

import { APIGatewayEventV2, Handler } from './core';

export function addValidation(
  schema: Schema,
): MiddlewareObj<APIGatewayEventV2<z.infer<typeof schema>>> {
  return {
    before: async (request) => {
      const { body, pathParameters, queryStringParameters } = request.event;
      const data = { ...queryStringParameters, ...pathParameters, ...body };
      const parsedData = await schema.safeParseAsync(data);
      if (!parsedData.success) {
        throw new BadRequestError({
          message: parsedData.error.message,
        });
      }
      request.event.body = parsedData.data;
    },
  };
}

export function withValidation<TBody, TRes>(schema: Schema, handler: Handler<TBody, TRes>) {
  return middy(handler).use(addValidation(schema));
}

type Schema = z.AnyZodObject | z.ZodEffects<z.AnyZodObject>;
