import { endOfDay as getEndOfDayBase } from 'date-fns';

export function endOfDay(date: Date | number): Date {
  return getEndOfDayBase(date);
}
