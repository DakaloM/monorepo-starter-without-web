import { baseConfig, mergeConfig } from '@num/testkit';

export default mergeConfig(baseConfig, {
  test: {
    coverage: {
      exclude: ['src/index.ts', 'src/interface'],
    },
  },
});
