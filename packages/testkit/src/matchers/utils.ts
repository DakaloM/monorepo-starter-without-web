export interface CustomMatcherResult {
  pass: boolean;
  message: () => string;
}

const noop = () => {
  return '';
};

/**
 * Creates a `pass` result object with an empty message.
 */
export function pass(): CustomMatcherResult {
  return { pass: true, message: noop };
}

/**
 * Creates a `fail` result object with a custom message.
 */
export function fail(message: () => string): CustomMatcherResult {
  return { pass: false, message };
}
