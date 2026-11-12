import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from '../controllers/categoryController.js';
import { authorize, protect } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { validate } from '../middleware/validate.js';
import { body, param } from 'express-validator';

const router = Router();

router.get('/', optionalAuth, getCategories);
router.get('/:id', param('id').isMongoId(), validate, getCategory);

router.post(
  '/',
  protect,
  authorize('admin'),
  body('name').trim().notEmpty(),
  validate,
  createCategory
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  param('id').isMongoId(),
  validate,
  updateCategory
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  param('id').isMongoId(),
  validate,
  deleteCategory
);

export default router;
