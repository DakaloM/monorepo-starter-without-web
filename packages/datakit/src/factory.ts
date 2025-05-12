import { BaseModel } from '~/model';

import { DatabaseContext } from './context';

export type MixedFactoryBuilder<Attrs = any, Factory = any, Result = any> = (
  attrs: Attrs,
  factory: Factory,
  ctx: DatabaseContext,
) => Result | Promise<Result>;

export type FactorySeed<Attrs = any, Factory = any, Result = any> = (
  attrs: Attrs,
  factory: Factory,
  ctx: DatabaseContext,
) => Promise<Result>;

/**
 * A factory is a set of named builders that create objects. The factory itself
 * will make sure that the created objects are inserted (`insert*` methods) or
 * just returned (`build*` methods).
 */
export interface Factory<Builders extends Record<string, any>, Seeds extends Record<string, any>> {
  /**
   * Inserts an objects into the database via Objection.js `insertGraph`.
   */
  insert<K extends keyof Builders>(
    builderName: K,
    attrs?: Parameters<Builders[K]>[0],
  ): ReturnType<Builders[K]>;

  /**
   * Inserts a number of objects into the database via Objection.js `insertGraph`.
   */
  insertMany<K extends keyof Builders>(
    count: number,
    builderName: K,
    attrs?: Parameters<Builders[K]>[0] | ((idx: number) => Parameters<Builders[K]>[0]),
  ): Promise<Awaited<ReturnType<Builders[K]>>[]>;

  /**
   * Executes a pre-defined seed function.
   */
  seed<K extends keyof Seeds>(seedName: K, attrs?: Parameters<Seeds[K]>[0]): ReturnType<Seeds[K]>;
}

/**
 * Ensures that a builder function always returns a `Promise<value>`.
 */
export function createBuilder<Builder extends MixedFactoryBuilder>(
  builderFn: Builder,
): (...args: Parameters<Builder>) => Promise<Awaited<ReturnType<Builder>>> {
  return (attrs, factory, ctx) => {
    const record = builderFn(attrs, factory, ctx);
    return typeof (record as PromiseLike<BaseModel>).then === 'function'
      ? record
      : Promise.resolve(record);
  };
}

/**
 * Ensures that a builder function always returns a `Promise<value>`.
 */
export function createSeed<Seed extends FactorySeed>(seedFn: Seed): Seed {
  return seedFn;
}

export function createFactory<
  Builders extends Record<string, any>,
  Seeds extends Record<string, any>,
>(builders: Builders, seeds: Seeds, ctx: DatabaseContext): Factory<Builders, Seeds> {
  const self: Factory<Builders, Seeds> = {
    insert(factory, attrs = {}) {
      if (!Object.prototype.hasOwnProperty.call(builders, factory)) {
        throw new Error(
          `Factory "${factory as string}" does not exist. Make sure it is correct ` +
            `and registered in src/test/setup.ts`,
        );
      }

      return builders[factory](attrs, {}, ctx).then((record: any) => {
        if (!ctx.db) {
          console.log('ctx.db is null');
        }

        return record.$query(ctx.db).insertGraph(record).execute();
      }) as any;
    },
    insertMany(count, builderName, attrs = {}) {
      if (!Object.prototype.hasOwnProperty.call(builders, builderName)) {
        throw new Error(
          `Builder "${
            builderName as string
          }" is not registered in this factory. Make sure it is correct ` +
            `and registered in src/test/setup.ts`,
        );
      }

      const records = [];
      for (let i = 0; i < count; i++) {
        const newAttrs = typeof attrs === 'function' ? (attrs as any)(i) : attrs;

        records.push(
          builders[builderName](newAttrs, {}, ctx).then((record: any) =>
            record.$query(ctx.db).insertGraph(record).execute(),
          ),
        );
      }

      return Promise.all(records);
    },
    seed(seedName, attrs = {}) {
      if (!Object.prototype.hasOwnProperty.call(seeds, seedName)) {
        throw new Error(
          `Seed "${
            seedName as string
          }" is not registered in this factory. Make sure it is correct ` +
            `and registered in src/test/setup.ts`,
        );
      }

      return seeds[seedName](attrs, self, ctx);
    },
  };

  return self;
}
