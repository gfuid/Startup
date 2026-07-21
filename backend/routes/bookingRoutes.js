const express = require('express');
const router = express.Router();
const { authMiddleware, providerMiddleware } = require('../middleware/auth');
const {
    createBooking,
    getCustomerBookings,
    getProviderBookings,
    updateBookingStatus,
    addReview,
    getBookingMessages,
} = require('../controllers/bookingController');

// Customer routes
router.post('/', authMiddleware, createBooking);
router.get('/customer', authMiddleware, getCustomerBookings);
router.post('/:id/review', authMiddleware, addReview);
router.get('/:id/messages', authMiddleware, getBookingMessages);

// Provider routes
router.get('/provider', authMiddleware, providerMiddleware, getProviderBookings);
router.put('/:id/status', authMiddleware, updateBookingStatus);

module.exports = router;