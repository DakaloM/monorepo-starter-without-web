const dotenv = require('dotenv');
const fs = require('fs');

const envConfig = dotenv.parse(fs.readFileSync('.env'));

module.exports = {
  apps: [
    {
      name: 'web',
      cwd: './apps/web',
      script: 'yarn',
      args: 'run start',
      interpreter: 'node',
      instances: 1,
      max_memory_restart: '1G',
      env: envConfig,
    },
    {
      name: 'api',
      cwd: './apps/api',
      script: 'yarn',
      args: 'run start',
      instances: 1,
      interpreter: 'node',
      autorestart: true,
      watch: true,
      max_memory_restart: '1G',
      env: envConfig,
    },
  ],
};
