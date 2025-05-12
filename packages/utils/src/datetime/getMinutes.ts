import { getMinutes as getMinutesBase } from 'date-fns';

export function getMinutes(date: Date | number): number {
  return getMinutesBase(date);
}
