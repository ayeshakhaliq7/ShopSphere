const router = require('express').Router();
const { register, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../utils/validators');

router.post('/register', v.register, validate, register);
router.post('/login', v.login, validate, login);
router.get('/me', protect, me);

module.exports = router;
