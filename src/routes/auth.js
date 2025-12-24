const express = require('express');
const { register, login } = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Apply authentication rate limiting to all auth routes
router.use(authLimiter);

router.post('/register', register);
router.post('/login', login);

module.exports = router;