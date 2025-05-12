import { ClassRef, IdObject } from '~/matchers';

interface CustomMatchers<R = unknown> {
  toBeISODate(expected: string | Date | null | undefined): R;
  toMatchError(expect: ClassRef, props?: string[]): R;
  toThrowErrorWithMessage(expected: ClassRef, expectedMessage: string): R;
  toIncludeIds(expected: IdObject[]): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
