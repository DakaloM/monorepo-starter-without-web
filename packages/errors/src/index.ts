export interface BaseErrorOpts {
  code?: string;
  message?: string;
  origin?: Error | null;
  path?: (string | number)[];
  debug?: Record<string, unknown>;
}

export class BaseError extends Error {
  code: string | null = null;
  debug: Record<string, unknown> = {};
  headers?: Record<string, string | number | string[]>;
  origin: Error | null = null;
  path: (string | number)[] = [];
  statusCode = 500;
  extensions: Record<string, unknown> = {};
  type: string | null = null;

  constructor(message: string | null = null) {
    super(message || 'The server encountered an internal error. Please retry the request.');
  }

  protected set(opts?: Partial<BaseErrorOpts>) {
    Object.assign(this, opts || {});
    if (this.code) {
      this.extensions.code = this.code;
      this.extensions.path = this.path;
    }
  }

  getHeaders(): Record<string, string | number | string[]> {
    return this.headers || {};
  }

  hasHeaders(): boolean {
    return !!this.headers;
  }

  hasDebugInfo() {
    return !!this.debug;
  }

  getDebugInfo(): Record<string, unknown> {
    return this.debug;
  }
}

export function isError(e: unknown): e is BaseError {
  return e instanceof Error && Number.isInteger((e as BaseError).statusCode);
}

export function isUserError(e: unknown): e is BaseError {
  return isError(e) && e.statusCode >= 400 && e.statusCode <= 499;
}

export class InternalError extends BaseError {
  statusCode = 500;
  code = 'InternalError';
  type = 'INTERNAL_ERROR';

  constructor(opts: Partial<BaseErrorOpts> = {}) {
    super('The server encountered an internal error. Please retry the request.');
    this.set(opts);
  }
}

export type BadRequestErrorIssue = {
  code: string;
  message: string;
  path: (string | number)[];
};

export class BadRequestError extends BaseError {
  statusCode = 400;
  code = 'InvalidInput';
  type = 'INVALID_INPUT';
  issues: BadRequestErrorIssue[] = [];

  constructor(opts: Partial<BadRequestError> = {}) {
    super('One of the request inputs is not valid.');
    this.set(opts);
  }
}

export class UnauthorizedError extends BaseError {
  statusCode = 401;
  code = 'InvalidAuthenticationInfo';
  type = 'UNAUTHORIZED';

  constructor(opts: Partial<BaseErrorOpts> & { authScheme?: string; realm?: string } = {}) {
    opts = Object.assign({ authScheme: 'Bearer' }, opts);

    super('Server failed to authenticate the request.');
    this.set(opts);

    if (opts.realm) {
      this.headers = {
        'www-authenticate': `${opts.authScheme} realm="${opts.realm}"`,
      };
    } else {
      this.headers = { 'www-authenticate': `${opts.authScheme}` };
    }
  }
}

export class ForbiddenError extends BaseError {
  statusCode = 403;
  code = 'InsufficientAccountPermissions';
  type = 'FORBIDDEN';

  constructor(opts: Partial<BaseErrorOpts> = {}) {
    super(
      'The account being accessed does not have sufficient permissions to execute this operation.',
    );
    this.set(opts);
  }
}

export class ConflictError extends BaseError {
  statusCode = 409;
  code = 'Conflict';
  type = 'CONFLICT';

  constructor(opts: Partial<BaseErrorOpts> = {}) {
    super('The specified resource already exists.');
    this.set(opts);
  }
}

export class ErrorBag extends Error {
  private payload: Error[];

  constructor(errors: Error[]) {
    super();
    this.payload = errors;
    this.message = `Errors:\n` + errors.map((err) => `- ${err.message}`).join('\n');
  }

  get errors() {
    return this.payload;
  }
}

export class NotFoundError extends BaseError {
  statusCode = 404;
  code = 'ResourceNotFound';
  type = 'NOT_FOUND';

  constructor(opts: Partial<BaseErrorOpts> = {}) {
    super('The specified resource does not exist.');
    this.set(opts);
  }
}

export enum ValidationErrorCodes {
  FORBIDDDEN = 'Forbidden',
  INPUT_TOO_LARGE = 'InputTooLarge',
  INPUT_TOO_SMALL = 'InputTooSmall',
  INTERNAL_ERROR = 'InternalError',
  INVALID_INPUT = 'InvalidInput',
  INVALID_TYPE = 'InvalidType',
  NOT_FOUND = 'NotFound',
  UNAUTHORIZED = 'Unauthorized',
  DUPLICATE_RESOURCE = 'DuplicateResource',
}
