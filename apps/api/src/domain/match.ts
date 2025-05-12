export function getMatchValues<T extends {}>(data: T, match: Partial<T>) {
  const path: (keyof T)[] = [];
  const keys = Object.keys(match) as (keyof T)[];

  keys.forEach((key) => {
    const value = data[key];
    const matchValue = match[key];

    if (value === matchValue) {
      path.push(key);
    }
  });

  return path;
}
