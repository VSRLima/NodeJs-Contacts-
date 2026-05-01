import { NextFunction, Request, Response } from 'express';
import { logger } from '../logging/logger.js';

export const httpLogger = (request: Request, response: Response, next: NextFunction) => {
  const startedAt = Date.now();

  response.on('finish', () => {
    logger.info('http_request', {
      request_id: request.requestId,
      method: request.method,
      path: request.originalUrl,
      status: response.statusCode,
      duration_ms: Date.now() - startedAt
    });
  });

  next();
};
