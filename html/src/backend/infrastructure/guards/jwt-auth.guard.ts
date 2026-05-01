import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../../application/auth-service.js';
import { UnauthorizedError } from '../../application/errors.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.header('authorization');
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;

    if (!token) {
      throw new UnauthorizedError('Missing bearer token');
    }

    try {
      request.user = this.authService.verifyAccessToken(token);
      return true;
    } catch {
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }
}
