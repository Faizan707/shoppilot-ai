import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err && typeof err === 'object' && 'name' in err) {
    const error = err as { name: string; message?: string; errors?: Record<string, { message: string }> };

    if (error.name === 'ValidationError' && error.errors) {
      statusCode = 400;
      message = 'Validation failed';
      errors = Object.values(error.errors).map((e) => e.message);
    } else if (error.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid ID format';
    } else if ('code' in err && (err as { code: number }).code === 11000) {
      statusCode = 409;
      message = 'Duplicate field value entered';
    } else if (error.message) {
      message = error.message;
    }
  }

  if (env.nodeEnv !== 'production') {
    console.error(err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors !== undefined ? { errors } : {}),
  });
}
