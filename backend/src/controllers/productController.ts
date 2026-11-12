import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendPaginated, sendSuccess } from '../utils/apiResponse.js';
import * as productService from '../services/productService.js';
import { getParam } from '../utils/params.js';

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.listProducts({
    page: Number(req.query.page),
    limit: Number(req.query.limit),
    search: req.query.search as string | undefined,
    category: req.query.category as string | undefined,
    minPrice: req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined,
    sort: req.query.sort as string | undefined,
    featured: req.query.featured === 'true',
    includeInactive: req.user?.role === 'admin' && req.query.all === 'true',
  });

  sendPaginated(res, result.products, result.meta, 'Products fetched');
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductByIdOrSlug(getParam(req, 'id'));
  sendSuccess(res, { product });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  sendSuccess(res, { product }, 'Product created', 201);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(getParam(req, 'id'), req.body);
  sendSuccess(res, { product }, 'Product updated');
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(getParam(req, 'id'));
  sendSuccess(res, null, 'Product deleted');
});

export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await productService.listProductReviews(getParam(req, 'id'));
  sendSuccess(res, { reviews });
});

export const addReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await productService.createReview(getParam(req, 'id'), req.user!.id, req.body);
  sendSuccess(res, { review }, 'Review added', 201);
});
