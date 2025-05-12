import { BadRequestError, ValidationErrorCodes } from '@num/serverkit';
import type { BadRequestErrorIssue } from '@num/serverkit';

import { z } from 'zod';
import { extensions } from '~/documents/contentTypes';

/**
 * Internal type to enhance a `ZodIssue`. See `refinements` for usage examples.
 */
type CustomIssue = z.ZodIssue & { _code: ValidationErrorCodes };

/**
 * Internal type to enhance a `z.SafeParseReturnType`.
 */
type ParseSafeReturnType<Schema extends z.ZodTypeAny> =
  | { valid: true; data: z.infer<Schema> }
  | { valid: false; issues: BadRequestErrorIssue[] };

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
 * Internal mapping of commonly used refinement functions. This mapping is
 * passed in `Validator.create` as the 2nd argument.
 *
 * Usage: `z.string().superRefine(refinements.uulidUuid)`
 */
const refinements = {
  filename: refineFilename,
  color: refineColor,
};

export function refineFilename(value: string, ctx: z.RefinementCtx): void {
  const parts = value.split('.');

  const ext = parts.pop() || '';
  const missingExt = !ext;

  const isValid = missingExt
    ? false
    : extensions.some((supportedExt) => supportedExt === `.${ext}`);

  if (!isValid) {
    const message = missingExt ? 'Missing file extension' : 'Invalid file extension';
    ctx.addIssue({
      _code: ValidationErrorCodes.INVALID_TYPE,
      code: z.ZodIssueCode.custom,
      message,
    } as CustomIssue);
  }
  const nameWithoutExt = parts.join('.');
  const isSmall = nameWithoutExt.length === 0;
  const isLong = nameWithoutExt.length > 5000;

  if (isSmall) {
    ctx.addIssue({
      _code: ValidationErrorCodes.INPUT_TOO_SMALL,
      code: z.ZodIssueCode.custom,
      message: 'String must contain at least 1 character(s)',
    } as CustomIssue);
  }

  if (isLong) {
    ctx.addIssue({
      _code: ValidationErrorCodes.INPUT_TOO_LARGE,
      code: z.ZodIssueCode.custom,
      message: 'String must contain at most 5000 character(s)',
    } as CustomIssue);
  }
}

export function refineColor(value: string, ctx: z.RefinementCtx): void {
  const re = new RegExp('^#([a-fA-F0-9]{6})$');
  if (!re.test(value)) {
    ctx.addIssue({
      _code: ValidationErrorCodes.INVALID_TYPE,
      code: z.ZodIssueCode.custom,
      message: 'invalid RGB value',
    } as CustomIssue);
  }
}
