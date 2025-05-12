import { isValid as isValidBase } from 'date-fns';

export function isValid(date: unknown): date is Date {
  return isValidBase(date);
}
