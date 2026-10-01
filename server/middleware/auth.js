const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

exports.protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Please sign in to continue.');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, 'Your session has expired. Please sign in again.');
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new HttpError(401, 'This account no longer exists.');
  if (!user.isActive) throw new HttpError(403, 'This account has been deactivated.');
  req.user = user;
  next();
});

exports.adminOnly = (req, _res, next) => {
  if (req.user?.role !== 'admin') return next(new HttpError(403, 'Admin access required.'));
  next();
};
