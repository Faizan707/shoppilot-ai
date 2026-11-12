import type { NextFunction, Request, Response } from 'express';
import { COOKIE_NAME, verifyToken } from '../utils/token.js';
import { User } from '../models/User.js';

/** Attaches req.user when a valid cookie is present; never blocks anonymous access. */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return next();

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('name email role isActive');
    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      };
    }
  } catch {
    // ignore invalid tokens for optional auth
  }
  next();
}
