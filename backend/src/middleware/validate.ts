import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export function validate(req: Request, _res: Response, next: NextFunction) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(
      new ApiError(
        400,
        'Validation failed',
        result.array().map((e) => ({ field: 'path' in e ? e.path : undefined, message: e.msg }))
      )
    );
  }
  next();
}
