import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as cartService from '../services/cartService.js';
import { getParam } from '../utils/params.js';

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const data = await cartService.getCart(req.user!.id);
  sendSuccess(res, data);
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const data = await cartService.addToCart(req.user!.id, req.body.productId, Number(req.body.quantity) || 1);
  sendSuccess(res, data, 'Added to cart');
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const data = await cartService.updateCartItem(
    req.user!.id,
    getParam(req, 'productId'),
    Number(req.body.quantity)
  );
  sendSuccess(res, data, 'Cart updated');
});

export const removeFromCart = asyncHandler(async (req: Request, res: Response) => {
  const data = await cartService.removeFromCart(req.user!.id, getParam(req, 'productId'));
  sendSuccess(res, data, 'Item removed');
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const data = await cartService.clearCart(req.user!.id);
  sendSuccess(res, data, 'Cart cleared');
});
