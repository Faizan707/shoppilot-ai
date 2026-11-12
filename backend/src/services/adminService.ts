import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export async function getDashboardStats() {
  const [
    totalProducts,
    totalCustomers,
    orderAgg,
    recentOrders,
    salesByDay,
  ] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
    ]),
    Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(8),
    Order.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' },
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    totalRevenue: orderAgg[0]?.totalRevenue || 0,
    totalOrders: orderAgg[0]?.totalOrders || 0,
    totalCustomers,
    totalProducts,
    recentOrders,
    salesOverview: salesByDay.map((d) => ({
      date: d._id,
      revenue: d.revenue,
      orders: d.orders,
    })),
  };
}

export async function listCustomers(page = 1, limit = 20, search?: string) {
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = { role: 'customer' };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [customers, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    customers,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function setCustomerActive(userId: string, isActive: boolean) {
  const user = await User.findOneAndUpdate(
    { _id: userId, role: 'customer' },
    { isActive },
    { new: true }
  ).select('-password');

  if (!user) throw new ApiError(404, 'Customer not found');
  return user;
}
