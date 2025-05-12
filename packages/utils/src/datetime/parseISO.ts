import { parseISO as parseISOBase } from 'date-fns';

export function parseISO(date: string): Date {
  return parseISOBase(date);
}
