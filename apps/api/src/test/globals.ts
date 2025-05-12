import { Context } from '~/context';

// This map stores partial contexts. For example it contains the `Context.db`
// prop so it can be used across requests. See `~/server/testContext` for more
// info.
export const contexts: Map<string, Partial<Context>> = new Map();
