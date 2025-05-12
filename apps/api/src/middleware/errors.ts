import { BaseError, isError, isUserError } from '@num/serverkit';

import { NextFunction, Response, Request } from 'express';
import { logger } from '~/logger';

export function getLoggerMetadata(err: unknown | BaseError): Record<string, any> | null {
  if (!isError(err)) {
    return null;
  }

  let metadata: Record<string, any> = {};

  metadata = Object.entries({
    origin: err.origin ? err.origin.stack : null,
    debug: err.hasDebugInfo() ? err.getDebugInfo() : null,
  }).reduce(
    (acc, [k, v]) => {
      if (v) acc[k] = v;
      return acc;
    },
    {} as typeof metadata,
  );

  return Object.entries(metadata).length > 0 ? metadata : null;
}

export const errorMiddleware =
  () => (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (isError(err) && err.hasHeaders()) {
      Object.entries(err.getHeaders()).forEach(([name, value]) => {
        res.setHeader(name, value);
      });
    }

    const metadata = getLoggerMetadata(err);

    if (isUserError(err)) {
      if (metadata) {
        logger.debug(metadata, err.stack);
      } else {
        logger.debug(err.stack);
      }

      res.status(err.statusCode).json({
        code: err.code,
        message: err.message,
      });

      return;
    }

    if (metadata) {
      logger.error(metadata, err.stack);
    } else {
      logger.error(err.stack);
    }

    res.status(500).json({
      code: 'InternalError',
      message: 'The server encountered an internal error. Please retry the request.',
    });
  };
