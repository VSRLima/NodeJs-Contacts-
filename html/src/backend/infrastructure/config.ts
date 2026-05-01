import dotenv from 'dotenv';

dotenv.config();

const numberFromEnv = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production';

const requiredInProduction = (key: string, fallback: string) => {
  const value = process.env[key];

  if (isProduction && !value) {
    throw new Error(`${key} is required in production`);
  }

  return value ?? fallback;
};

export const config = {
  nodeEnv,
  port: numberFromEnv(process.env.PORT, 3000),
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: numberFromEnv(process.env.DB_PORT, 3306),
    username: process.env.DB_USER ?? 'contacts',
    password: process.env.DB_PASSWORD ?? 'contacts',
    database: process.env.DB_NAME ?? 'contacts',
    synchronize: process.env.DB_SYNCHRONIZE ? process.env.DB_SYNCHRONIZE === 'true' : !isProduction,
    connectRetries: numberFromEnv(process.env.DB_CONNECT_RETRIES, 15),
    connectRetryDelayMs: numberFromEnv(process.env.DB_CONNECT_RETRY_DELAY_MS, 2000)
  },
  jwt: {
    accessSecret: requiredInProduction('JWT_ACCESS_SECRET', 'dev-access-secret'),
    refreshSecret: requiredInProduction('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '2h'
  },
  admin: {
    name: process.env.ADMIN_NAME ?? 'admin',
    password: process.env.ADMIN_PASSWORD ?? 'admin123'
  }
};
