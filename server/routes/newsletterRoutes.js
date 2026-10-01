const router = require('express').Router();
const { subscribe } = require('../controllers/newsletterController');
const validate = require('../middleware/validate');
const v = require('../utils/validators');

router.post('/', v.newsletter, validate, subscribe);

module.exports = router;
