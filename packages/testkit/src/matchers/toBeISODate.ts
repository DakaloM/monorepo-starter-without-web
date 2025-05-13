import { formatISO, parseISO } from '@repo/utils';

import { CustomMatcherResult, fail, pass } from './utils';

export type IdObject = string | { id: string };

/**
 * Checks if a lists contains a set of IDs. An ID can either be a string or an
 * object with a key `id`. The order of appearance is not important.
 */
export function toBeISODate(
  received?: string | Date | null,
  expected?: string | Date | null,
): CustomMatcherResult {
  if (expected === null || expected === undefined) {
    if (received === null || received === undefined) {
      return pass();
    } else {
      return fail(() => `Expected to not receive a value`);
    }
  }
  if (received === null || received == undefined) {
    return fail(() => `Expected to receive an ISO date`);
  }

  const receivedISO = formatISO(typeof received === 'string' ? parseISO(received) : received);

  const expectedISO = formatISO(typeof expected === 'string' ? parseISO(expected) : expected);

  if (receivedISO !== expectedISO) {
    return fail(
      () => `Expected date "${expectedISO}" does not match received date "${receivedISO}"`,
    );
  }

  return pass();
}
