const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');

exports.getCategories = asyncHandler(async (_req, res) => {
  res.json({ categories: await Category.find().sort('name') });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ category });
});
