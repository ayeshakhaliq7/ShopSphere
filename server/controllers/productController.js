const Product = require('../models/Product');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

const SORTS = {
  newest: { createdAt: -1 },
  'price-asc': { finalPrice: 1 },
  'price-desc': { finalPrice: -1 },
  rating: { rating: -1, numReviews: -1 },
  popular: { numReviews: -1, rating: -1 },
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.getProducts = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, rating, inStock, featured, sort = 'newest' } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);

  const filter = {};

  if (category) {
    const cat = await Category.findOne({
      $or: [{ slug: category.toLowerCase() }, ...(category.match(/^[a-f\d]{24}$/i) ? [{ _id: category }] : [])],
    });
    filter.category = cat ? cat._id : null;
  }

  if (search) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    const matchingCategories = await Category.find({ name: rx }).select('_id');
    filter.$or = [{ name: rx }, { description: rx }, { category: { $in: matchingCategories.map((c) => c._id) } }];
  }

  if (minPrice || maxPrice) {
    filter.finalPrice = {};
    if (minPrice) filter.finalPrice.$gte = Number(minPrice);
    if (maxPrice) filter.finalPrice.$lte = Number(maxPrice);
  }
  if (rating) filter.rating = { $gte: Number(rating) };
  if (inStock === 'true') filter.stock = { $gt: 0 };
  if (featured === 'true') filter.featured = true;

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(SORTS[sort] || SORTS.newest)
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  res.json({ products, page, pages: Math.ceil(total / limit), total });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product) throw new HttpError(404, 'Product not found.');
  res.json({ product });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ product: await product.populate('category', 'name slug') });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found.');
  const editable = ['name', 'description', 'price', 'discountPrice', 'category', 'images', 'stock', 'featured'];
  editable.forEach((key) => {
    if (req.body[key] !== undefined) product[key] = req.body[key];
  });
  await product.save(); // save() (not findOneAndUpdate) so finalPrice is recomputed
  res.json({ product: await product.populate('category', 'name slug') });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found.');
  res.json({ message: 'Product deleted.' });
});
