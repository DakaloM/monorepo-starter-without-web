import { Plugin } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';

export function vscodeExportPlugin(): Plugin {
  return {
    name: '@num/buildkit:vscode-exports',
    async setup() {
      const rootDir = process.cwd();
      const pkgJson = JSON.parse(await fs.readFile(path.join(rootDir, 'package.json'), 'utf-8'));
      const exports = pkgJson.exports || {};
      delete exports['.'];
      const keys = Object.keys(exports);
      if (!keys.length) {
        return;
      }

      await Promise.all(
        keys.map(async (key) => {
          const value = exports[key].import;
          const source = `/* eslint-disable no-restricted-imports */
          export * from "${value}"
          `;
          const v = key.replace('./', '');
          await fs.writeFile(path.join(rootDir, `${v}.d.ts`), source);
        }),
      );
    },
  };
}
