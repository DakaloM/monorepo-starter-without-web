export type GetObjectPath<T> = {
  [K in keyof T]: K extends string
    ? T[K] extends Record<string, unknown>
      ? `${K}.${GetObjectPath<T[K]>}` | K
      : K
    : never;
}[keyof T];

export type StringKeyType<T> = {
  [K in keyof T]: T[K] extends string ? T[K] : never;
}[keyof T];

export function createObjectMap<T, K extends StringKeyType<T>>(items: T[], mapper: (item: T) => K) {
  return items.reduce(
    (memo, item) => {
      const key = mapper(item);
      return {
        ...memo,
        [key]: item,
      };
    },
    {} as Record<K, T>,
  );
}

//@ts-ignore
export type ObjectMap<T, K extends keyof T> = Record<T[K], T>;
