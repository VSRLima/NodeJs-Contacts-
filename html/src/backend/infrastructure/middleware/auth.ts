import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../../application/auth-service.js';
import { UnauthorizedError } from '../../application/errors.js';

export const authenticate =
  (authService: AuthService) => (request: Request, _response: Response, next: NextFunction) => {
    const header = request.header('authorization');
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;

    if (!token) {
      next(new UnauthorizedError('Missing bearer token'));
      return;
    }

    try {
      request.user = authService.verifyAccessToken(token);
      next();
    } catch {
      next(new UnauthorizedError('Invalid or expired access token'));
    }
  };
