import { setMinutes as setMinutesBase } from 'date-fns';

export function setMinutes(date: Date | number, minutes: number): Date {
  return setMinutesBase(date, minutes);
}
