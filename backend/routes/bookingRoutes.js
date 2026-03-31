// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // JWT protect
const { createBooking, getMyBookings } = require('../controllers/bookingController');

// @route  POST api/v1/bookings
router.post('/', auth, createBooking);
router.get('/my-bookings', auth, getMyBookings);

module.exports = router;