import { addWeeks as addWeeksBase } from 'date-fns';

export function addWeeks(date: Date | number, amount: number): Date {
  return addWeeksBase(date, amount);
}
