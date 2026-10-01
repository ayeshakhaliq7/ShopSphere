const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

exports.getUsers = asyncHandler(async (_req, res) => {
  res.json({ users: await User.find().sort('-createdAt') });
});

exports.getUser = asyncHandler(async (req, res) => {
  const isSelf = String(req.user._id) === req.params.id;
  if (!isSelf && req.user.role !== 'admin') throw new HttpError(403, 'You cannot view this user.');
  const user = await User.findById(req.params.id);
  if (!user) throw new HttpError(404, 'User not found.');
  const [stats] = await Order.aggregate([
    { $match: { user: user._id, status: { $ne: 'Cancelled' } } },
    { $group: { _id: null, orderCount: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' } } },
  ]);
  res.json({ user, stats: { orderCount: stats?.orderCount || 0, totalSpent: stats?.totalSpent || 0 } });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const isSelf = String(req.user._id) === req.params.id;
  const isAdmin = req.user.role === 'admin';
  if (!isSelf && !isAdmin) throw new HttpError(403, 'You cannot edit this user.');

  const user = await User.findById(req.params.id).select('+password');
  if (!user) throw new HttpError(404, 'User not found.');

  const { name, email, password, currentPassword, role, isActive } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;

  if (password) {
    // Users must prove they know the current password; admins resetting someone else's do not.
    if (isSelf && !(currentPassword && (await user.matchPassword(currentPassword)))) {
      throw new HttpError(401, 'Current password is incorrect.');
    }
    user.password = password;
  }

  if (isAdmin && !isSelf) {
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
  }

  await user.save();
  res.json({ user });
});

/* ----- Wishlist (belongs to the signed-in user) ----- */
exports.getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({ path: 'wishlist', populate: { path: 'category', select: 'name slug' } });
  res.json({ wishlist: user.wishlist });
});

exports.addToWishlist = asyncHandler(async (req, res) => {
  if (!(await Product.exists({ _id: req.params.productId }))) throw new HttpError(404, 'Product not found.');
  await User.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: req.params.productId } });
  res.json({ message: 'Added to wishlist.' });
});

exports.removeFromWishlist = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: req.params.productId } });
  res.json({ message: 'Removed from wishlist.' });
});
