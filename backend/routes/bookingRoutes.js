const express = require('express');
const router = express.Router();
const { authMiddleware, providerMiddleware, optionalAuthMiddleware } = require('../middleware/auth');
const {
    createBooking,
    getCustomerBookings,
    getProviderBookings,
    updateBookingStatus,
    addReview,
    getBookingMessages,
    verifyStartOtp,
    triggerSos,
} = require('../controllers/bookingController');

// Customer routes
router.post('/', optionalAuthMiddleware, createBooking);
router.get('/customer', authMiddleware, getCustomerBookings);
router.post('/:id/review', optionalAuthMiddleware, addReview);
router.get('/:id/messages', authMiddleware, getBookingMessages);

// Provider & Common routes
router.get('/provider', authMiddleware, providerMiddleware, getProviderBookings);
router.put('/:id/status', authMiddleware, updateBookingStatus);
router.post('/:id/verify-otp', authMiddleware, verifyStartOtp);
router.post('/:id/sos', optionalAuthMiddleware, triggerSos);

module.exports = router;