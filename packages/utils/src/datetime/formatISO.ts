import { formatISO as formatISOBase } from 'date-fns';

export function formatISO(
  date: Date,
  { representation = 'complete' }: { representation?: 'date' | 'time' | 'complete' } = {},
): string {
  return formatISOBase(date, { representation });
}
