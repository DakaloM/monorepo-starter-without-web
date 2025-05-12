import { ClassRef } from './toThrowErrorWithMessage';
import { fail } from './utils';

/**
 * Checks if a error is an instanceof a given class and has a matching message.
 */
export function toMatchError(
  received: Error,
  expected: ClassRef,
  props: string[] = ['message'],
): any {
  // @ts-ignore
  const instance = this as any;

  if (!(received instanceof Error)) {
    return fail(
      () => `Expected to receive an Error instance:\n\n` + instance.utils.diff(received, expected),
    );
  }

  if (!(received instanceof expected)) {
    return fail(() => `Expected an error of type "${expected.name}".`);
  }

  const receivedProps = props.reduce(
    (acc, prop) => {
      acc[prop] = (received as Record<string, any>)[prop];
      return acc;
    },
    {} as Record<string, any>,
  );

  return instance.toMatchSnapshot.call(instance as any, receivedProps);
}
