export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code = 'APP_ERROR',
    public details?: unknown
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, string>) {
    super(400, 'Validation failed', 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}
