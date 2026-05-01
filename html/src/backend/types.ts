import { AuthUser } from './application/auth-service.js';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: AuthUser;
    }
  }
}

export {};
