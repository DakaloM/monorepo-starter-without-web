import { createEnvironment } from './create-environment.mjs';

const Commands: Record<string, Command> = {
  env: createEnvironment,
};

const argv = process.argv.slice(2);

if (argv.length) {
  const [commandName, ...args] = argv;
  const command = Commands[commandName];
  if (command) {
    command(args).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
}

type Command = (args: string[]) => Promise<void>;
