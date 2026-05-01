import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ValidationError } from '../../application/errors.js';
import { AppError } from '../../application/errors.js';
import { logger } from '../logging/logger.js';

const mysqlErrorCode = (error: QueryFailedError) => {
  const driverError = error.driverError as { code?: string } | undefined;
  return driverError?.code;
};

const validationErrorFromQuery = (error: QueryFailedError) => {
  const code = mysqlErrorCode(error);

  if (code === 'ER_DATA_TOO_LONG' && error.message.includes("'picture'")) {
    return new ValidationError({ picture: 'picture is too long' });
  }

  if (code === 'ER_DUP_ENTRY') {
    const message = error.message.toLowerCase();

    if (message.includes('contact')) {
      return new ValidationError({ contact: 'contact is already in use' });
    }

    if (message.includes('email_address')) {
      return new ValidationError({ email_address: 'email_address is already in use' });
    }
  }

  return null;
};

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

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

    if (error instanceof QueryFailedError) {
      const validationError = validationErrorFromQuery(error);

      if (validationError) {
        response.status(validationError.statusCode).json({
          error: {
            code: validationError.code,
            message: validationError.message,
            details: validationError.details,
            request_id: request.requestId
          }
        });
        return;
      }
    }

    if (error instanceof HttpException) {
      const status = error.getStatus();
      response.status(status).json({
        error: {
          code: HttpStatus[status] ?? 'HTTP_ERROR',
          message: error.message,
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
  }
}
