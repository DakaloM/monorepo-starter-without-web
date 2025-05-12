import { getHours as getHoursBase } from 'date-fns';

export function getHours(date: Date | number): number {
  return getHoursBase(date);
}
