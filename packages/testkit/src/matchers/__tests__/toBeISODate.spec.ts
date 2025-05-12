import { toBeISODate } from '../toBeISODate';

describe('test/matchers/toBeISODate', () => {
  test('accepts empty expected dates', () => {
    expect(toBeISODate(null, null)).toHaveProperty('pass', true);
    expect(toBeISODate(undefined, undefined)).toHaveProperty('pass', true);
    expect(toBeISODate(null, undefined)).toHaveProperty('pass', true);
    expect(toBeISODate(undefined, null)).toHaveProperty('pass', true);
  });

  test('accepts string dates', () => {
    const result = toBeISODate('2020-03-22T10:42:29Z', '2020-03-22T10:42:29Z');
    expect(result.pass).toBeTruthy();
  });

  test('accepts date', () => {
    const result = toBeISODate(new Date(), new Date());
    expect(result.pass).toBeTruthy();
  });

  test('compares dates correctly', () => {
    expect(toBeISODate(new Date().toISOString(), new Date()).pass).toBeTruthy();
    expect(
      toBeISODate('2020-03-22T10:00:00Z+01:00', '2020-03-22T00:00:00Z+01:00').message(),
    ).toMatch('does not match received date');
  });

  test('rejects empty received dates', () => {
    const result = toBeISODate(null, new Date());
    expect(result.pass).toBeFalsy();
    expect(result.message()).toEqual('Expected to receive an ISO date');
  });

  test('rejects a received date when expected is empty', () => {
    const result = toBeISODate(new Date(), null);
    expect(result.pass).toBeFalsy();
    expect(result.message()).toEqual('Expected to not receive a value');
  });
});
