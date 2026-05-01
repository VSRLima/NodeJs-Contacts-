import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import express from 'express';
import type { Request, Response } from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AuthService } from './application/auth-service.js';
import { validationExceptionFactory } from './application/validators.js';
import { AppModule } from './app.module.js';
import { ForbiddenError } from './application/errors.js';
import { config } from './infrastructure/config.js';
import { AppExceptionFilter } from './infrastructure/filters/app-exception.filter.js';
import { httpLogger } from './infrastructure/middleware/http-logger.js';
import { requestIdMiddleware } from './infrastructure/middleware/request-id.js';

import './types.js';

export const createApp = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    logger: false
  });
  app.use(requestIdMiddleware);
  app.use(httpLogger);
  app.use(helmet());
  app.enableCors({
    origin(origin, callback) {
      if (!origin || config.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new ForbiddenError(`Origin ${origin} is not allowed by CORS`));
    }
  });
  app.use(express.json({ limit: '1mb' }));
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: validationExceptionFactory,
      transform: true,
      whitelist: true
    })
  );
  app.useGlobalFilters(new AppExceptionFilter());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const publicPath = path.resolve(__dirname, '../../public');
  app.use(express.static(publicPath));

  await app.init();
  const server = app.getHttpAdapter().getInstance();
  server.get('*', (_request: Request, response: Response) => {
    response.sendFile(path.join(publicPath, 'index.html'));
  });

  return { app, authService: app.get(AuthService) };
};
