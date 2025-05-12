import { addMonths as addMonthsBase } from 'date-fns';

export function addMonths(date: Date | number, amount: number): Date {
  return addMonthsBase(date, amount);
}
