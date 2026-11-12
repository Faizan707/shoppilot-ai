import { Router } from 'express';
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { body, param } from 'express-validator';

const router = Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/', body('productId').isMongoId(), validate, addToWishlist);
router.delete('/:productId', param('productId').isMongoId(), validate, removeFromWishlist);

export default router;
