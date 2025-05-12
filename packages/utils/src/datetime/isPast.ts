import { isPast as isPastBase } from 'date-fns';

export function isPast(date: Date | number): boolean {
  return isPastBase(date);
}
