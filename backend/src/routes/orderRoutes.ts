import { Router } from 'express';
import {
  cancelMyOrder,
  createOrder,
  getMyOrder,
  getMyOrders,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createOrderValidator } from '../validators/orderValidators.js';
import { param } from 'express-validator';

const router = Router();

router.use(protect);

router.post('/', createOrderValidator, validate, createOrder);
router.get('/', getMyOrders);
router.get('/:id', param('id').isMongoId(), validate, getMyOrder);
router.put('/:id/cancel', param('id').isMongoId(), validate, cancelMyOrder);

export default router;
