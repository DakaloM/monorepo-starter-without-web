import { InternalError } from '@repo/serverkit';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AuthContext } from '~/auth';

/**
 * Creates a new middleware that initializes the `req.ctx.auth` based on the
 * information extracted from the request (e.g. the authorization header).
 */
export function createAuthContextMiddleware(): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;

    if (!req.ctx) {
      return next(
        new InternalError({
          message: `The request does not contain a valid context.`,
        }),
      );
    }
    if (!header) {
      return next();
    }

    try {
      req.ctx.auth = await AuthContext.fromAuthHeader(header, req.ctx);
      return next();
    } catch (err) {
      return next(err);
    }
  };
}
