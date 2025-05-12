import { default as tsconfigPaths, PluginOptions } from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

type PathsPlugin = (opts?: PluginOptions) => any;
const paths = ('default' in tsconfigPaths ? tsconfigPaths.default : tsconfigPaths) as PathsPlugin;

export const baseConfig = defineConfig({
  plugins: [paths()],
  test: {
    globals: true,
    setupFiles: [
      '../../packages/serverkit/dist/configure.js',
      '../../packages/testkit/dist/setup.js',
    ],
    threads: true,
    include: ['src/**/*.{spec,e2e}.ts'],
    coverage: {
      exclude: ['src/index.ts'],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
});
