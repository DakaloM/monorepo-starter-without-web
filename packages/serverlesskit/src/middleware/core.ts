import middy, { MiddyfiedHandler } from '@middy/core';
import cors from '@middy/http-cors';
import jsonBodyParser from '@middy/http-json-body-parser';
import { Cache } from '@repo/cache';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import z, { AnyZodObject } from 'zod';

import { addResponse } from './response';
import { addValidation } from './validation';

export function withMiddleware<TBody, TResponse>(
  handler: Handler<TBody, TResponse>,
  schema?: undefined,
): MiddyfiedHandler<APIGatewayEventV2<undefined>>;

export function withMiddleware<TBody, TResponse>(
  handler: Handler<TBody, TResponse>,
  schema: AnyZodObject,
): MiddyfiedHandler<APIGatewayEventV2<z.infer<typeof schema>>>;

export function withMiddleware<TBody, TResponse>(
  handler: Handler<TBody, TResponse>,
  schema?: AnyZodObject | undefined,
): MiddyfiedHandler<TBody, TResponse> {
  const jsonParseHandler = middy(handler)
    .use(jsonBodyParser())
    .use(addResponse())
    .use(cors()) as MiddyfiedHandler<TBody, TResponse>;
  if (schema) {
    return jsonParseHandler.use(addValidation(schema)) as MiddyfiedHandler<TBody, TResponse>;
  }
  return jsonParseHandler;
}

export type APIGatewayEventV2<T = string | undefined> = Omit<APIGatewayProxyEventV2, 'body'> & {
  body: T;
  cache: Cache;
};

export enum StatusCode {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
}

export type HttpResponse<T> = {
  statusCode: StatusCode;
  body: T;
};

export type Handler<TEvent, TRes> = (event: TEvent) => Promise<TRes>;

export type RestHandler<TBody = string | undefined, TResponse = any> = (
  event: APIGatewayEventV2<TBody>,
) => Promise<HttpResponse<TResponse>>;
