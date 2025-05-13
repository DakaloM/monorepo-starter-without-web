import { baseConfig, mergeConfig } from '@repo/testkit';

export default mergeConfig(baseConfig, {
  test: {
    coverage: {
      exclude: ['src/index.ts', 'src/interface'],
    },
  },
});
