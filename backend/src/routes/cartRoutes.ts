import { Router } from 'express';
import {
  addToCart,
  clearCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { body, param } from 'express-validator';

const router = Router();

router.use(protect);

router.get('/', getCart);
router.post('/', body('productId').isMongoId(), validate, addToCart);
router.put(
  '/:productId',
  param('productId').isMongoId(),
  body('quantity').isInt({ min: 1 }),
  validate,
  updateCartItem
);
router.delete('/', clearCart);
router.delete('/:productId', param('productId').isMongoId(), validate, removeFromCart);

export default router;
