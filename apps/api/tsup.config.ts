import { options, defineConfig } from '@num/buildkit';

export default defineConfig({
  ...options,
  dts: false,
  external: options.external.concat(['esbuild', '@num/testkit']),
  format: ['cjs'],
  entry: ['src/index.ts', 'db/**/*.ts'],
});
