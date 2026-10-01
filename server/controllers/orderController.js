const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING = 9.99;
const round = (n) => Math.round(n * 100) / 100;

exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  // Prices and stock always come from the database, never from the client.
  const ids = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: ids } });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const lines = items.map(({ product, quantity }) => {
    const p = byId.get(String(product));
    if (!p) throw new HttpError(404, 'One of the products in your cart no longer exists.');
    if (p.stock < quantity) throw new HttpError(409, `Only ${p.stock} of "${p.name}" left in stock.`);
    return { product: p._id, name: p.name, image: p.images[0], price: p.finalPrice, quantity };
  });

  const itemsPrice = round(lines.reduce((sum, l) => sum + l.price * l.quantity, 0));
  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

  const order = await Order.create({
    user: req.user._id,
    products: lines,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalAmount: round(itemsPrice + shippingPrice),
    estimatedDelivery,
  });

  await Promise.all(lines.map((l) => Product.updateOne({ _id: l.product }, { $inc: { stock: -l.quantity } })));
  res.status(201).json({ order });
});

exports.getOrders = asyncHandler(async (req, res) => {
  const isAdminScope = req.user.role === 'admin' && req.query.scope === 'all';
  const filter = isAdminScope ? {} : { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  const orders = await Order.find(filter).populate('user', 'name email').sort('-createdAt');
  res.json({ orders });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw new HttpError(404, 'Order not found.');
  const isOwner = String(order.user._id) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') throw new HttpError(403, 'You cannot view this order.');
  res.json({ order });
});

const restock = (order) =>
  Promise.all(order.products.map((l) => Product.updateOne({ _id: l.product }, { $inc: { stock: l.quantity } })));

exports.updateStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new HttpError(404, 'Order not found.');
  if (order.status === 'Cancelled') throw new HttpError(409, 'Cancelled orders cannot be changed.');
  const { status } = req.body;
  if (status === 'Cancelled') await restock(order);
  order.status = status;
  await order.save();
  res.json({ order: await order.populate('user', 'name email') });
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new HttpError(404, 'Order not found.');
  if (order.status !== 'Pending') throw new HttpError(409, 'Only pending orders can be cancelled.');
  await restock(order);
  order.status = 'Cancelled';
  await order.save();
  res.json({ order });
});
