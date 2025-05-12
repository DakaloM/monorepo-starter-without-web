import { setHours as setHoursBase } from 'date-fns';

export function setHours(date: Date | number, hours: number): Date {
  return setHoursBase(date, hours);
}
