import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Initializes the config based on `NODE_ENV`. Will load the `.env*` files
 * when the environment is not "production".
 */
export function initConfig(root: string): {
  env: 'development' | 'test' | 'production';
  paths: { root: string };
} {
  const env =
    process.env.NODE_ENV === 'production'
      ? 'production'
      : process.env.NODE_ENV == 'test'
      ? 'test'
      : 'development';

  // Make sure this is run first so `process.env` is populated correctly.
  // Note: The path stays correct even if this file is compiled into `/dist`.
  if (env !== 'production') {
    const files = [env ? `.env.${env}` : null, env ? `.env.${env}.dist` : null].filter(
      (p) => p && fs.existsSync(path.join(root, p)),
    );

    dotenv.config({ path: path.join(root, files[0] || '.env'), override: true });

    dotenv.config({ path: path.join(root, '.env'), override: true });
  }

  return {
    env,
    paths: {
      root,
    },
  };
}
