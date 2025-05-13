import { options, defineConfig } from '@repo/buildkit';

export default defineConfig({
  ...options,
  dts: false,
  external: options.external.concat(['esbuild', '@repo/testkit']),
  format: ['cjs'],
  entry: ['src/index.ts', 'db/**/*.ts'],
});
