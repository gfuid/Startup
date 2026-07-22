// backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { createOrder, verifyPayment, updateProviderPayoutDetails } = require('../controllers/paymentController');

router.post('/order', authMiddleware, createOrder);
router.post('/verify', authMiddleware, verifyPayment);
router.post('/provider-payout-details', authMiddleware, updateProviderPayoutDetails);

module.exports = router;
