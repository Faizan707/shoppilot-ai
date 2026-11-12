import { Router } from 'express';
import {
  addReview,
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  getReviews,
  updateProduct,
} from '../controllers/productController.js';
import { authorize, protect } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { validate } from '../middleware/validate.js';
import {
  createProductValidator,
  reviewValidator,
  updateProductValidator,
} from '../validators/productValidators.js';

const router = Router();

router.get('/', optionalAuth, getProducts);
router.get('/:id', getProduct);
router.get('/:id/reviews', getReviews);

router.post('/', protect, authorize('admin'), createProductValidator, validate, createProduct);
router.put('/:id', protect, authorize('admin'), updateProductValidator, validate, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

router.post('/:id/reviews', protect, reviewValidator, validate, addReview);

export default router;
