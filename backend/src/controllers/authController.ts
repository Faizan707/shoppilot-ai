import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  changePassword,
  getCurrentUser,
  loginUser,
  registerUser,
  updateUserProfile,
} from '../services/authService.js';
import { clearAuthCookie, setAuthCookie } from '../utils/token.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  setAuthCookie(res, result.token);
  sendSuccess(res, { user: result.user }, 'Registration successful', 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  setAuthCookie(res, result.token);
  sendSuccess(res, { user: result.user }, 'Login successful');
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookie(res);
  sendSuccess(res, null, 'Logged out successfully');
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await getCurrentUser(req.user!.id);
  sendSuccess(res, { user }, 'Current user');
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await updateUserProfile(req.user!.id, req.body);
  sendSuccess(res, { user }, 'Profile updated');
});

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  await changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
  sendSuccess(res, null, 'Password updated successfully');
});
