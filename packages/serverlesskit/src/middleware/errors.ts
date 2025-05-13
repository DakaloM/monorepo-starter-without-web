import { MiddlewareObj } from '@middy/core';
import { BaseError, isUserError, ValidationErrorCodes } from '@repo/errors';

import { StatusCode } from './core';

export function withErrors(): MiddlewareObj {
  return {
    onError: (event: any) => {
      const error = event.error as BaseError;
      if (isUserError(error)) {
        event.response = {
          statusCode: error.statusCode,
          body: { code: error.code, message: error.message },
        };
        return;
      }
      event.response = {
        statusCode: StatusCode.InternalServerError,
        body: {
          code: ValidationErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error. Please try again later.',
        },
      };
    },
  };
}
