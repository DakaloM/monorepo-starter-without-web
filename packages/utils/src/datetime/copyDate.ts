import {
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getSeconds,
  getYear,
  setDate,
  setHours,
  setMinutes,
  setMonth,
  setSeconds,
  setYear,
} from 'date-fns';

type Prop = 'year' | 'month' | 'day' | 'hours' | 'minutes' | 'seconds';

export function copyDate(source: Date | number, target: Date | number, props: Prop[]): Date {
  if (typeof target === 'number') {
    target = new Date(target);
  }

  return props.reduce<Date>((acc, prop) => {
    switch (prop) {
      case 'year':
        return setYear(acc, getYear(source));
      case 'month':
        return setMonth(acc, getMonth(source));
      case 'day':
        return setDate(acc, getDate(source));
      case 'hours':
        return setHours(acc, getHours(source));
      case 'minutes':
        return setMinutes(acc, getMinutes(source));
      case 'seconds':
        return setSeconds(acc, getSeconds(source));
      default:
        throw Error('Invalid prop');
    }
  }, target);
}
