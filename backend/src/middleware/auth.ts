import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { COOKIE_NAME, verifyToken } from '../utils/token.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

export async function protect(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('name email role isActive');

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User not found or inactive');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}

export function authorize(...roles: Array<'customer' | 'admin'>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You are not authorized to access this resource'));
    }
    next();
  };
}

/** For future FastAPI AI service → Node internal calls */
export function internalServiceAuth(req: Request, _res: Response, next: NextFunction) {
  const secret = req.headers['x-internal-service-secret'];
  if (!env.internalServiceSecret || secret !== env.internalServiceSecret) {
    return next(new ApiError(401, 'Invalid internal service credentials'));
  }
  next();
}
