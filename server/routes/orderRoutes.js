const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../utils/validators');

router.use(protect);
router.post('/', v.order, validate, ctrl.createOrder);
router.get('/', ctrl.getOrders);
router.get('/:id', v.mongoId(), validate, ctrl.getOrder);
router.put('/:id/cancel', v.mongoId(), validate, ctrl.cancelOrder);
router.put('/:id/status', adminOnly, v.mongoId(), v.orderStatus, validate, ctrl.updateStatus);

module.exports = router;
