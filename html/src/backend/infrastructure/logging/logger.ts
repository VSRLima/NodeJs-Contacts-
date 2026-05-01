type LogLevel = 'info' | 'warn' | 'error';

const write = (level: LogLevel, message: string, meta: Record<string, unknown> = {}) => {
  const line = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  };

  process.stdout.write(`${JSON.stringify(line)}\n`);
};

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => write('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write('error', message, meta)
};
