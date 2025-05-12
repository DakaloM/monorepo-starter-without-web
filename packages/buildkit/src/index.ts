import { Options } from 'tsup';
import { vscodeExportPlugin } from '~/plugins/vscode-exports';

export { defineConfig } from 'tsup';

export interface BuildkitOptions extends Omit<Options, 'external'> {
  external: string[];
}

export const options: BuildkitOptions = {
  entry: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/*.e2e.ts'],
  splitting: false,
  sourcemap: true,
  dts: true,
  external: [],
  esbuildPlugins: [vscodeExportPlugin()],
  format: ['esm', 'cjs'],
  clean: false,
};
