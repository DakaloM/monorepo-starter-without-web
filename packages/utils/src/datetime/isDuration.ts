import { Duration } from './duration';

const keys = ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds'];

export function isDuration(value: unknown): value is Duration {
  return (
    typeof value === 'object' && value !== null && Object.keys(value).some((k) => keys.includes(k))
  );
}
