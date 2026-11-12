import { Cart } from '../models/Cart.js';
import { Order, ORDER_STATUSES, type IShippingAddress, type OrderStatus } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';

function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SP-${stamp}-${rand}`;
}

export async function createOrderFromCart(userId: string, shippingAddress: IShippingAddress) {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  const orderItems = [];
  let itemsPrice = 0;

  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      throw new ApiError(400, 'One or more products are unavailable');
    }
    if (product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${product.name}`);
    }

    const unitPrice = product.price;
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: unitPrice,
      quantity: item.quantity,
    });
    itemsPrice += unitPrice * item.quantity;
  }

  const shippingPrice = itemsPrice >= 5000 ? 0 : 250;
  const taxPrice = Math.round(itemsPrice * 0.05);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const order = await Order.create({
    user: userId,
    orderNumber: generateOrderNumber(),
    items: orderItems,
    shippingAddress,
    paymentMethod: 'COD',
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    status: 'Pending',
    statusHistory: [{ status: 'Pending', note: 'Order placed', at: new Date() }],
  });

  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, sold: item.quantity },
    });
  }

  cart.items = [];
  await cart.save();

  return order;
}

export async function getUserOrders(userId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments({ user: userId }),
  ]);

  return {
    orders,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getUserOrderById(userId: string, orderId: string) {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
}

export async function cancelUserOrder(userId: string, orderId: string) {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new ApiError(404, 'Order not found');

  if (!['Pending', 'Confirmed'].includes(order.status)) {
    throw new ApiError(400, 'Order can no longer be cancelled');
  }

  order.status = 'Cancelled';
  order.statusHistory.push({ status: 'Cancelled', note: 'Cancelled by customer', at: new Date() });
  await order.save();

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, sold: -item.quantity },
    });
  }

  return order;
}

export async function listAllOrders(query: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {};

  if (query.status) filter.status = query.status;
  if (query.search) {
    filter.orderNumber = { $regex: query.search, $options: 'i' };
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getOrderByIdAdmin(orderId: string) {
  const order = await Order.findById(orderId).populate('user', 'name email phone');
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
  if (!ORDER_STATUSES.includes(status)) {
    throw new ApiError(400, 'Invalid order status');
  }

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  if (order.status === 'Cancelled') {
    throw new ApiError(400, 'Cancelled orders cannot be updated');
  }

  order.status = status;
  order.statusHistory.push({ status, note, at: new Date() });

  if (status === 'Delivered') {
    order.deliveredAt = new Date();
    order.isPaid = true;
    order.paidAt = new Date();
  }

  await order.save();
  return order;
}
