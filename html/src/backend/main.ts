import { createApp } from './app.js';
import { config } from './infrastructure/config.js';
import { AppDataSource } from './infrastructure/db/data-source.js';
import { logger } from './infrastructure/logging/logger.js';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const initializeDatabase = async () => {
  for (let attempt = 1; attempt <= config.db.connectRetries; attempt += 1) {
    try {
      await AppDataSource.initialize();
      return;
    } catch (error) {
      const isLastAttempt = attempt === config.db.connectRetries;
      const message = error instanceof Error ? error.message : String(error);

      if (isLastAttempt) {
        throw error;
      }

      logger.warn('database_connection_retry', {
        message,
        attempt,
        max_attempts: config.db.connectRetries,
        retry_delay_ms: config.db.connectRetryDelayMs,
        db_host: config.db.host,
        db_port: config.db.port
      });

      await sleep(config.db.connectRetryDelayMs);
    }
  }
};

const bootstrap = async () => {
  await initializeDatabase();
  const { app, authService } = await createApp();
  await authService.ensureAdminSeed(config.admin.name, config.admin.password);

  const server = await app.listen(config.port, () => {
    logger.info('server_started', {
      port: config.port,
      node_env: config.nodeEnv
    });
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      logger.error('server_port_in_use', {
        port: config.port,
        hint: 'Port is already in use. Stop the Docker app container with `docker compose down`, use `npm run db:up` for MariaDB-only dev, or set PORT to another value.'
      });
      process.exit(1);
    }

    throw error;
  });
};

bootstrap().catch((error) => {
  logger.error('server_start_failed', {
    message: error instanceof Error ? error.message : String(error),
    hint: 'Start MariaDB with `npm run db:up`, run everything with `npm run dev:stack`, or update DB_HOST/DB_PORT in .env.'
  });
  process.exit(1);
});
