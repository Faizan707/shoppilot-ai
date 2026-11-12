import { body } from 'express-validator';
import { ORDER_STATUSES } from '../models/Order.js';

export const createOrderValidator = [
  body('shippingAddress.fullName').trim().notEmpty(),
  body('shippingAddress.phone').trim().notEmpty(),
  body('shippingAddress.street').trim().notEmpty(),
  body('shippingAddress.city').trim().notEmpty(),
  body('shippingAddress.state').trim().notEmpty(),
  body('shippingAddress.postalCode').trim().notEmpty(),
  body('shippingAddress.country').trim().notEmpty(),
];

export const updateOrderStatusValidator = [
  body('status').isIn([...ORDER_STATUSES]).withMessage('Invalid status'),
  body('note').optional().isString(),
];
