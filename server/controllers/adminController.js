const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.getStats = asyncHandler(async (_req, res) => {
  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);
  since.setMonth(since.getMonth() - 5); // last 6 calendar months

  const [totals, monthly, totalProducts, totalUsers, recentOrders] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, sales: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
    ]),
    Product.countDocuments(),
    User.countDocuments(),
    Order.find().populate('user', 'name email').sort('-createdAt').limit(6),
  ]);

  // Always return six months, including empty ones, so charts have a stable shape.
  const months = [];
  for (let i = 0; i < 6; i += 1) {
    const d = new Date(since.getFullYear(), since.getMonth() + i, 1);
    const hit = monthly.find((r) => r._id.y === d.getFullYear() && r._id.m === d.getMonth() + 1);
    months.push({
      label: d.toLocaleString('en-US', { month: 'short' }),
      revenue: Math.round((hit?.revenue || 0) * 100) / 100,
      orders: hit?.orders || 0,
    });
  }

  res.json({
    totalSales: Math.round((totals[0]?.sales || 0) * 100) / 100,
    totalOrders: totals[0]?.orders || 0,
    totalProducts,
    totalUsers,
    monthly: months,
    recentOrders,
  });
});
