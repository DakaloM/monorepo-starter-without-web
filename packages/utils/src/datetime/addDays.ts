import { addDays as addDaysBase } from 'date-fns';

export function addDays(date: Date | number, amount: number): Date {
  return addDaysBase(date, amount);
}
