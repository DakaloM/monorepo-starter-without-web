import { options, defineConfig } from '@repo/buildkit';

export default defineConfig({
  ...options,
  external: options.external.concat(['pg', 'knex', 'objection']),
});
