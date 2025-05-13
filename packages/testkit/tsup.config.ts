import { defineConfig, options } from '@repo/buildkit';

const external = options.external.concat(['vite-tsconfig-paths']);

export default defineConfig({
  ...options,
  external,
});
