const express = require('express');
const { loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/auth/login
router.post('/login', loginUser);

// GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;
