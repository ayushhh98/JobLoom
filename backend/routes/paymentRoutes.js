const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { verifyPayment, createPaymentIntent } = require('../controllers/paymentController');

router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/verify', protect, verifyPayment);

module.exports = router;
