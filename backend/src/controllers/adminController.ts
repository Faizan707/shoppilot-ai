import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendPaginated, sendSuccess } from '../utils/apiResponse.js';
import * as adminService from '../services/adminService.js';
import * as productService from '../services/productService.js';
import { getParam } from '../utils/params.js';

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();
  sendSuccess(res, stats);
});

export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.listCustomers(
    Number(req.query.page) || 1,
    Number(req.query.limit) || 20,
    req.query.search as string | undefined
  );
  sendPaginated(res, result.customers, result.meta);
});

export const toggleCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await adminService.setCustomerActive(getParam(req, 'id'), Boolean(req.body.isActive));
  sendSuccess(res, { customer }, 'Customer updated');
});

export const getAdminProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductByIdAdmin(getParam(req, 'id'));
  sendSuccess(res, { product });
});
