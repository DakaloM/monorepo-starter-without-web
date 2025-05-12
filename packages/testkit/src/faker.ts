import { faker as baseFaker } from '@faker-js/faker';

// NOTE: This is a simple way to extend `faker` with additional methods

/**
 * Sets the `insertedAt` and `updatedAt` to a random date in the past.
 */
export function timestamps(): Timestamps {
  const createdAt = faker.date.past();
  const updatedAt = faker.date.between({
    from: createdAt,
    to: new Date(),
  });

  createdAt.setMilliseconds(0);
  updatedAt.setMilliseconds(0);

  return { createdAt, updatedAt };
}

/**
 * Returns a reverse domain name identifier.
 */
export function identifier(suffix?: string): string {
  return [
    faker.internet.domainSuffix(),
    faker.internet.domainWord(),
    suffix ? suffix : faker.internet.domainWord() + sequence('identifier'),
  ].join('.');
}

// TODO: This is a naive implementation of counters. We should refactor to
// use `Atomic` to avoid concurrency issues.
const sequences = new Map<string, number>();
export function sequence(name = 'default'): number {
  if (!sequences.has(name)) {
    sequences.set(name, 0);
    return 1;
  }

  const currentValue = sequences.get(name) as number;
  sequences.set(name, currentValue + 1);
  return currentValue + 1;
}

export function maybe(valueFn: () => any, fallbackValue: any, p = 0.5) {
  return !!p && Math.random() <= p ? valueFn() : fallbackValue;
}

export const faker = Object.freeze(
  Object.assign({}, baseFaker, {
    timestamps,
    identifier,
    sequence,
  }),
);

export type Timestamps = {
  createdAt: Date;
  updatedAt: Date;
};
