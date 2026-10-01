const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');
const generateToken = require('../utils/generateToken');

const authResponse = (user) => ({ token: generateToken(user._id), user });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) throw new HttpError(409, 'An account with this email already exists.');
  // Role is never taken from the request body: public sign-ups are always regular users.
  const user = await User.create({ name, email, password });
  res.status(201).json(authResponse(user));
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw new HttpError(401, 'Incorrect email or password.');
  if (!user.isActive) throw new HttpError(403, 'This account has been deactivated.');
  res.json(authResponse(user));
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
