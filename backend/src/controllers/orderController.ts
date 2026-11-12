import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendPaginated, sendSuccess } from '../utils/apiResponse.js';
import * as orderService from '../services/orderService.js';
import type { OrderStatus } from '../models/Order.js';
import { getParam } from '../utils/params.js';

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrderFromCart(req.user!.id, req.body.shippingAddress);
  sendSuccess(res, { order }, 'Order placed successfully', 201);
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.getUserOrders(
    req.user!.id,
    Number(req.query.page) || 1,
    Number(req.query.limit) || 10
  );
  sendPaginated(res, result.orders, result.meta);
});

export const getMyOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getUserOrderById(req.user!.id, getParam(req, 'id'));
  sendSuccess(res, { order });
});

export const cancelMyOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.cancelUserOrder(req.user!.id, getParam(req, 'id'));
  sendSuccess(res, { order }, 'Order cancelled');
});

export const adminGetOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.listAllOrders({
    page: Number(req.query.page),
    limit: Number(req.query.limit),
    status: req.query.status as string | undefined,
    search: req.query.search as string | undefined,
  });
  sendPaginated(res, result.orders, result.meta);
});

export const adminGetOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderByIdAdmin(getParam(req, 'id'));
  sendSuccess(res, { order });
});

export const adminUpdateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrderStatus(
    getParam(req, 'id'),
    req.body.status as OrderStatus,
    req.body.note
  );
  sendSuccess(res, { order }, 'Order status updated');
});
