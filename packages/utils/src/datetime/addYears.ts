import { addYears as addYearsBase } from 'date-fns';

export function addYears(date: Date | number, amount: number): Date {
  return addYearsBase(date, amount);
}
