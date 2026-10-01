const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../utils/validators');

router.use(protect);

// Wishlist routes must be declared before "/:id"
router.get('/wishlist', ctrl.getWishlist);
router.post('/wishlist/:productId', v.mongoId('productId'), validate, ctrl.addToWishlist);
router.delete('/wishlist/:productId', v.mongoId('productId'), validate, ctrl.removeFromWishlist);

router.get('/', adminOnly, ctrl.getUsers);
router.get('/:id', v.mongoId(), validate, ctrl.getUser);
router.put('/:id', v.mongoId(), v.userUpdate, validate, ctrl.updateUser);

module.exports = router;
