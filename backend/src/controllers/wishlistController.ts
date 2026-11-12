import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as wishlistService from '../services/wishlistService.js';
import { getParam } from '../utils/params.js';

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await wishlistService.getWishlist(req.user!.id);
  sendSuccess(res, { wishlist });
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await wishlistService.addToWishlist(req.user!.id, req.body.productId);
  sendSuccess(res, { wishlist }, 'Added to wishlist');
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await wishlistService.removeFromWishlist(req.user!.id, getParam(req, 'productId'));
  sendSuccess(res, { wishlist }, 'Removed from wishlist');
});
