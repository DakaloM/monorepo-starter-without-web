export type Optional<T> = T | undefined;
export type PromiseOfOptional<T> = Promise<Optional<T>>;
export type SyncOrAsync<T> = Promise<T> | T;
