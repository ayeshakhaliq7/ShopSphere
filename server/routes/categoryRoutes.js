const router = require('express').Router();
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../utils/validators');

router.get('/', getCategories);
router.post('/', protect, adminOnly, v.category, validate, createCategory);

module.exports = router;
