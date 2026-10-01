const Review = require('../models/Review');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

exports.getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.id }).populate('user', 'name').sort('-createdAt');
  res.json({ reviews });
});

exports.createReview = asyncHandler(async (req, res) => {
  if (!(await Product.exists({ _id: req.params.id }))) throw new HttpError(404, 'Product not found.');
  const { rating, comment } = req.body;
  const existing = await Review.findOne({ product: req.params.id, user: req.user._id });
  if (existing) throw new HttpError(409, 'You have already reviewed this product.');
  const review = await Review.create({ product: req.params.id, user: req.user._id, rating, comment });
  res.status(201).json({ review: await review.populate('user', 'name') });
});
