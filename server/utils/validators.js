const { body, param } = require('express-validator');

const mongoId = (field = 'id', where = param) => where(field).isMongoId().withMessage('Invalid identifier.');

exports.mongoId = mongoId;

exports.register = [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Za-z]/).withMessage('Password must include a letter.')
    .matches(/\d/).withMessage('Password must include a number.'),
];

exports.login = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

exports.product = (partial = false) => {
  const opt = (chain) => (partial ? chain.optional() : chain);
  return [
    opt(body('name').trim().notEmpty().withMessage('Product name is required.')),
    opt(body('description').trim().notEmpty().withMessage('Description is required.')),
    opt(body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number.')).toFloat(),
    body('discountPrice').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage('Discount price must be a positive number.').toFloat(),
    opt(body('category').isMongoId().withMessage('Choose a valid category.')),
    opt(body('images').isArray({ min: 1 }).withMessage('Add at least one image URL.')),
    body('images.*').optional().isURL({ require_tld: false }).withMessage('Each image must be a valid URL.'),
    opt(body('stock').isInt({ min: 0 }).withMessage('Stock must be 0 or more.')).toInt(),
    body('featured').optional().isBoolean().toBoolean(),
  ];
};

exports.category = [
  body('name').trim().notEmpty().withMessage('Category name is required.'),
  body('description').optional().trim(),
  body('image').optional().trim(),
];

exports.review = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.').toInt(),
  body('comment').trim().isLength({ min: 3, max: 1000 }).withMessage('Review must be 3-1000 characters.'),
];

exports.order = [
  body('items').isArray({ min: 1 }).withMessage('Your cart is empty.'),
  body('items.*.product').isMongoId().withMessage('Invalid product in cart.'),
  body('items.*.quantity').isInt({ min: 1, max: 20 }).withMessage('Quantity must be between 1 and 20.').toInt(),
  body('shippingAddress.fullName').trim().notEmpty().withMessage('Full name is required.'),
  body('shippingAddress.email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('shippingAddress.phone').trim().matches(/^[+\d][\d\s()-]{6,19}$/).withMessage('Enter a valid phone number.'),
  body('shippingAddress.address').trim().notEmpty().withMessage('Address is required.'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required.'),
  body('shippingAddress.postalCode').trim().notEmpty().withMessage('Postal code is required.'),
  body('paymentMethod').isIn(['demo-card', 'cash-on-delivery']).withMessage('Choose a payment method.'),
];

exports.orderStatus = [
  body('status').isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']).withMessage('Invalid status.'),
];

exports.userUpdate = [
  body('name').optional().trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters.'),
  body('email').optional().trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Za-z]/).withMessage('Password must include a letter.')
    .matches(/\d/).withMessage('Password must include a number.'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role.'),
  body('isActive').optional().isBoolean().toBoolean(),
];

exports.newsletter = [body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail()];
