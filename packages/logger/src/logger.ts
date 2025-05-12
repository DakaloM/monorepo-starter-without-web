import pino, { Logger as BaseLogger } from 'pino';

export type Logger = BaseLogger;

export type LoggerLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';

export interface LoggerOptions {
  name: string;
  level: LoggerLevel;
  pretty?: boolean;
}

/**
 * Creates a new logger to be used in server-side apps.
 */
export function createLogger({ name, level, pretty }: LoggerOptions): Logger {
  return pino({
    name,
    level,
    formatters: {
      bindings() {
        return {};
      },
    },
    ...(pretty
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
            },
          },
        }
      : {}),
  });
}
