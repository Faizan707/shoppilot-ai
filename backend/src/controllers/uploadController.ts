import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import * as s3Service from '../services/s3Service.js';

export const uploadProductImages = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files?.length) {
    throw new ApiError(400, 'At least one image file is required');
  }

  const urls = await s3Service.uploadManyImages(files, 'products');
  sendSuccess(res, { urls }, 'Images uploaded', 201);
});
