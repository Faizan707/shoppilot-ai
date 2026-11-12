import { body, param } from 'express-validator';

export const createProductValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('compareAtPrice').optional().isFloat({ min: 0 }),
  body('category').isMongoId().withMessage('Valid category is required'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
  body('images.*').isString().notEmpty(),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('brand').optional().isString(),
  body('tags').optional().isArray(),
  body('isFeatured').optional().isBoolean(),
];

export const updateProductValidator = [
  param('id').isMongoId(),
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 }),
  body('compareAtPrice').optional().isFloat({ min: 0 }),
  body('category').optional().isMongoId(),
  body('images').optional().isArray({ min: 1 }),
  body('stock').optional().isInt({ min: 0 }),
  body('isFeatured').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
];

export const reviewValidator = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment').trim().notEmpty().withMessage('Comment is required').isLength({ max: 1000 }),
];
