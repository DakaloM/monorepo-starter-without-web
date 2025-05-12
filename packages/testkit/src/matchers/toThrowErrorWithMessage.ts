import { CustomMatcherResult, fail, pass } from './utils';

export type ClassRef = new (...args: any[]) => any;
/**
 * Checks if a error is an instanceof a given class and has a matching
 * message.
 */
export function toThrowErrorWithMessage(
  received: Error | (() => void),
  expected: ClassRef,
  expectedMessage: string,
): CustomMatcherResult {
  // @ts-ignore
  const instance = this as any;
  if (!(received instanceof Error)) {
    try {
      received();
    } catch (err) {
      received = err as Error;
    }
  }

  if (!(received instanceof Error)) {
    return fail(
      () => `Expected to receive an Error instance:\n\n` + instance.utils.diff(received, expected),
    );
  }

  if (!(received instanceof expected) || received.message !== expectedMessage) {
    return fail(
      () =>
        `Expected an error of type "${expected.name}" with message:\n\n` +
        instance.utils.diff((received as Error).message, expectedMessage),
    );
  }

  return pass();
}
