import type { Request } from 'express';
import { ApiError } from './ApiError.js';

export function getParam(req: Request, name: string): string {
  const value = req.params[name];
  const resolved = Array.isArray(value) ? value[0] : value;
  if (!resolved) {
    throw new ApiError(400, `Missing route parameter: ${name}`);
  }
  return resolved;
}
