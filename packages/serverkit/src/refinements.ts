import { ValidationErrorCodes } from '@num/errors';

import { z } from 'zod';

function isMobileNumber(value: string): boolean {
  return /^(\+?1)?[2-9]\d{2}[2-9](?!11)\d{6}$/.test(value);
}
/**
 * Validates that a given string is a ULID encoded as a UUID.
 */
export function refineMobileNumber(value: string, ctx: z.RefinementCtx) {
  if (!isMobileNumber(value)) {
    ctx.addIssue({
      _code: ValidationErrorCodes.INVALID_TYPE,
      code: z.ZodIssueCode.custom,
      message: 'Invalid Mobile Number',
    } as CustomIssue);
  }
}

/**
 * Internal type to enhance a `ZodIssue`. See `refinements` for usage examples.
 */
export type CustomIssue = z.ZodIssue & { _code: ValidationErrorCodes };
