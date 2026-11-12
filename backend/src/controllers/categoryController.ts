import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as categoryService from '../services/categoryService.js';
import { getParam } from '../utils/params.js';

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const includeInactive = req.user?.role === 'admin' && req.query.all === 'true';
  const categories = await categoryService.listCategories(Boolean(includeInactive));
  sendSuccess(res, { categories });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryById(getParam(req, 'id'));
  sendSuccess(res, { category });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  sendSuccess(res, { category }, 'Category created', 201);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(getParam(req, 'id'), req.body);
  sendSuccess(res, { category }, 'Category updated');
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.deleteCategory(getParam(req, 'id'));
  sendSuccess(res, null, 'Category deleted');
});
