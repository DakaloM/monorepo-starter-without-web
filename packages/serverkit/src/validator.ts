import { BadRequestError, BadRequestErrorIssue, ValidationErrorCodes } from '@repo/errors';
import { z } from 'zod';
import { CustomIssue, refineMobileNumber } from '~/refinements';

const refinements = {
  mobileNumber: refineMobileNumber,
};
/**
 * Validator class that wraps some functionality of Zod to allow the conversion
 * to our standards.
 */
export class Validator<Schema extends z.ZodTypeAny> {
  constructor(readonly schema: Schema) {}
  /**
   * Create a new validator based on a given schema. The builder function
   * receives `zod` and a mapping of commonly used refinements to be used
   * with `superRefine`.
   */
  static create<Builder extends (zod: typeof z, refs: typeof refinements) => any>(
    builder: Builder,
  ): Validator<ReturnType<Builder>> {
    return new Validator(builder(z, refinements));
  }

  /**
   * Wraps Zod's `parse` to return our error classes.
   */
  public parse(data: unknown): z.infer<Schema> {
    try {
      return this.schema.parse(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw new BadRequestError({
          issues: parseIssues(err) /* , origin: err */,
        });
      }
      throw err;
    }
  }

  /**
   * Wraps Zod's `safeParse` to return the list of issues if the input is not
   * valid.
   */
  public parseSafe<Data = unknown>(data: Data): ParseSafeReturnType<Schema> {
    const result = this.schema.safeParse(data);
    if (result.success) {
      return { valid: true, data: result.data };
    } else {
      return { valid: false, issues: parseIssues(result.error) };
    }
  }
}

/**
 * Converts a `ZodError` into a flat list of issues. See `parseIssue` for more
 * details on the conversion.
 */
function parseIssues(err: z.ZodError): BadRequestErrorIssue[] {
  const issues = err.flatten(parseIssue);

  const fieldErrors = Object.values(issues.fieldErrors).flatMap((i) => i) as BadRequestErrorIssue[];

  return issues.formErrors.concat(fieldErrors).filter(Boolean);
}

/**
 * Converts a `ZodIssue` into a `BadRequestErrorIssue`. Updates error codes
 * and messages to match our standards.
 */
function parseIssue(issue: z.ZodIssue): BadRequestErrorIssue {
  const base = {
    message: issue.message,
    code: ValidationErrorCodes.INVALID_INPUT,
    path: issue.path,
  };

  if ((issue as CustomIssue)._code) {
    base.code = (issue as CustomIssue)._code;
  }

  if (issue.code === z.ZodIssueCode.too_small) {
    base.code = ValidationErrorCodes.INPUT_TOO_SMALL;
  } else if (issue.code === z.ZodIssueCode.too_big) {
    base.code = ValidationErrorCodes.INPUT_TOO_LARGE;
  } else if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.received === 'undefined' || issue.received === 'null') {
      base.code = ValidationErrorCodes.INVALID_TYPE;
      base.message = 'A required value was not specified.';
    } else {
      base.code = ValidationErrorCodes.INVALID_TYPE;
      base.message = 'An invalid value was provided.';
    }
  }

  return base;
}

/**
 * Internal type to enhance a `z.SafeParseReturnType`.
 */
type ParseSafeReturnType<Schema extends z.ZodTypeAny> =
  | { valid: true; data: z.infer<Schema> }
  | { valid: false; issues: BadRequestErrorIssue[] };
