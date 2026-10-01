const router = require('express').Router();
const ctrl = require('../controllers/productController');
const reviews = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../utils/validators');

router.get('/', ctrl.getProducts);
router.post('/', protect, adminOnly, v.product(false), validate, ctrl.createProduct);

router.get('/:id/reviews', v.mongoId(), validate, reviews.getReviews);
router.post('/:id/reviews', protect, v.mongoId(), v.review, validate, reviews.createReview);

router.get('/:id', v.mongoId(), validate, ctrl.getProduct);
router.put('/:id', protect, adminOnly, v.mongoId(), v.product(true), validate, ctrl.updateProduct);
router.delete('/:id', protect, adminOnly, v.mongoId(), validate, ctrl.deleteProduct);

module.exports = router;
