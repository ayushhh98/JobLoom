const express = require('express');
const { register, login, getMe, logout, verifyEmail, verifyEmailToken, resendOtp } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/verify-token', verifyEmailToken);
router.post('/resend-otp', resendOtp);
router.get('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
