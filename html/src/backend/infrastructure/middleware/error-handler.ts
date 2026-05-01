import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../application/errors.js';
import { logger } from '../logging/logger.js';

export const errorHandler = (
  error: Error,
  request: Request,
  response: Response,
  _next: NextFunction
) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        request_id: request.requestId
      }
    });
    return;
  }

  logger.error('unhandled_error', {
    request_id: request.requestId,
    message: error.message,
    stack: error.stack
  });

  response.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected server error',
      request_id: request.requestId
    }
  });
};
