import { Router } from 'express';
import {
  getAdminProduct,
  getCustomers,
  getDashboard,
  toggleCustomer,
} from '../controllers/adminController.js';
import {
  adminGetOrder,
  adminGetOrders,
  adminUpdateOrderStatus,
} from '../controllers/orderController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateOrderStatusValidator } from '../validators/orderValidators.js';
import { body, param } from 'express-validator';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/customers', getCustomers);
router.put(
  '/customers/:id',
  param('id').isMongoId(),
  body('isActive').isBoolean(),
  validate,
  toggleCustomer
);
router.get('/products/:id', param('id').isMongoId(), validate, getAdminProduct);
router.get('/orders', adminGetOrders);
router.get('/orders/:id', param('id').isMongoId(), validate, adminGetOrder);
router.put(
  '/orders/:id/status',
  param('id').isMongoId(),
  updateOrderStatusValidator,
  validate,
  adminUpdateOrderStatus
);

export default router;
