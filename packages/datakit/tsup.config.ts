import { options, defineConfig } from '@num/buildkit';

export default defineConfig({
  ...options,
  external: options.external.concat(['pg', 'knex', 'objection']),
});
